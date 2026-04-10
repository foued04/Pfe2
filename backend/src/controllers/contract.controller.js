const asyncHandler = require('../utils/asyncHandler');
const contractService = require('../services/contract.service');
const rentalRequestService = require('../services/rentalRequest.service');
const propertyService = require('../services/property.service');
const { sendContractEmail, sendContractSignedEmail } = require('../services/email.service');
const ApiError = require('../utils/ApiError');

// @desc    Générer un contrat à partir d'une demande
// @route   POST /api/contracts/generate
exports.generateContract = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await rentalRequestService.getRentalRequestById(requestId);

  if (!request) {
    throw new ApiError(404, 'Demande non trouvée');
  }

  // Vérifier que c'est bien le propriétaire (ou admin) qui génère le contrat
  if (request.property.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Accès refusé');
  }

  const existing = await contractService.getContractByRequestId(requestId);
  if (existing) {
    return res.send(existing);
  }

  const contractBody = {
    request: requestId,
    property: request.property._id,
    owner: request.property.owner._id,
    tenant: request.tenant._id,
    rentAmount: request.property.rent,
    depositAmount: request.property.rent * 2,
    status: 'Draft'
  };

  const contract = await contractService.createContract(contractBody);
  await rentalRequestService.updateRentalRequestStatus(requestId, 'Contrat généré');
  
  res.status(201).send(contract);
});

// @desc    Récupérer un contrat par l'ID de la demande
// @route   GET /api/contracts/request/:requestId
exports.getContract = asyncHandler(async (req, res) => {
  const contract = await contractService.getContractByRequestId(req.params.requestId);
  if (!contract) {
    throw new ApiError(404, 'Contrat non trouvé');
  }
  res.send(contract);
});

// @desc    Signer un contrat
// @route   PUT /api/contracts/:contractId/sign
exports.signContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const { signature } = req.body;

  if (!signature) {
    throw new ApiError(400, 'Signature requise');
  }

  const updateBody = {};
  if (req.user.role === 'owner') {
    updateBody.ownerSignature = signature;
    updateBody.status = 'SignedByOwner';
  } else {
    updateBody.tenantSignature = signature;
    updateBody.status = 'SignedByTenant';
  }

  const contract = await contractService.updateContract(contractId, updateBody);

  // Send notification to owner when tenant signs
  if (req.user.role !== 'owner' && contract.status === 'SignedByTenant') {
    try {
        const Notification = require('../models/Notification.model');
        await Notification.create({
            recipient: contract.owner._id,
            type: 'Contrat',
            title: 'Contrat signé par le locataire',
            preview: `Le locataire a signé le contrat.`,
            content: `Le locataire a signé le contrat pour le bien ${contract.property?.title || 'votre bien'}. Vous pouvez maintenant l'activer.`,
            contractData: {
              contractId: contractId,
              propertyTitle: contract.property?.title || 'Votre bien',
              propertyAddress: contract.property?.address || '',
              propertyImage: contract.property?.image || '',
              startDate: '',
              endDate: '',
              rent: contract.rentAmount || 0
            }
        });
        // Send email to owner
        await sendContractSignedEmail(contract.owner.email, {
          propertyTitle: contract.property?.title || 'Votre bien',
          propertyAddress: contract.property?.address || '',
          rent: contract.rentAmount || 0
        });
    } catch (err) { console.error("Notification error:", err); }
  }

  res.send(contract);
});

// @desc    Valider et Activer un contrat
// @route   PUT /api/contracts/:contractId/activate
exports.activateContract = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const contract = await contractService.getContractById(contractId);

  if (!contract) {
    throw new ApiError(404, 'Contrat non trouvé');
  }

  // Seul le propriétaire peut activer
  if (contract.owner._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Seul le propriétaire peut activer le contrat');
  }

  if (contract.status !== 'SignedByTenant') {
    throw new ApiError(400, "Le locataire n'a pas encore signé le contrat");
  }

  const updatedContract = await contractService.updateContract(contractId, { status: 'SignedByBoth' });
  
  await rentalRequestService.updateRentalRequestStatus(contract.request, 'Contrat actif');
  await propertyService.updatePropertyById(contract.property, { status: 'rented' });

  res.send(updatedContract);
});

// @desc    Envoyer le contrat au locataire
// @route   PUT /api/contracts/:contractId/send
exports.sendToTenant = asyncHandler(async (req, res) => {
  const { contractId } = req.params;
  const { message } = req.body;

  const contract = await contractService.updateContract(contractId, { 
    status: 'SentToTenant',
    tenantMessage: message
  });

  // Create notification for tenant when owner sends contract
  try {
    const Notification = require('../models/Notification.model');
    await Notification.create({
      recipient: contract.tenant._id,
      type: 'Contrat',
      title: 'Contrat de location à signer',
      preview: `Le propriétaire a signé et envoyé le contrat de location.`,
      content: `Le propriétaire a signé et envoyé le contrat de location. Veuillez le consulter et le signer.`,
      contractData: {
        contractId: contractId,
        propertyTitle: contract.property?.title || 'Votre bien',
        propertyAddress: contract.property?.address || '',
        propertyImage: contract.property?.image || '',
        startDate: '',
        endDate: '',
        rent: contract.rentAmount || 0
      }
    });
  } catch (err) { 
    console.error("Notification error:", err); 
  }

  // Send email notification to tenant
  try {
    await sendContractEmail(contract.tenant.email, {
      propertyTitle: contract.property?.title || 'Votre bien',
      propertyAddress: contract.property?.address || '',
      rent: contract.rentAmount || 0
    });
  } catch (err) {
    console.error("Email error:", err);
  }

  res.send(contract);
});
