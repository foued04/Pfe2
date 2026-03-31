const asyncHandler = require('../utils/asyncHandler');
const contractService = require('../services/contract.service');
const rentalRequestService = require('../services/rentalRequest.service');
const propertyService = require('../services/property.service');
const ApiError = require('../utils/ApiError');

const generateContract = asyncHandler(async (req, res) => {
  const { requestId } = req.body;
  const request = await rentalRequestService.getRentalRequestById(requestId);

  if (request.property.owner._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Forbidden');
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

const getContract = asyncHandler(async (req, res) => {
  const contract = await contractService.getContractByRequestId(req.params.requestId);
  if (!contract) {
    throw new ApiError(404, 'Contract not found');
  }
  res.send(contract);
});

const signContract = asyncHandler(async (req, res) => {
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

module.exports = {
  generateContract,
  getContract,
  signContract,
};
