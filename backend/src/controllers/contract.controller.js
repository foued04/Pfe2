const asyncHandler = require('../utils/asyncHandler');
const contractService = require('../services/contract.service');
const rentalRequestService = require('../services/rentalRequest.service');
const propertyService = require('../services/property.service');
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
  const contract = await contractService.updateContract(contractId, { 
    status: req.user.role === 'owner' ? 'SignedByOwner' : 'SignedByBoth' 
  });

  if (contract.status === 'SignedByBoth') {
    await rentalRequestService.updateRentalRequestStatus(contract.request, 'Contrat actif');
    await propertyService.updatePropertyById(contract.property, { status: 'rented' });
  }

  res.send(contract);
});
