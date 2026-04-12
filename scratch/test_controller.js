const contractController = require('./backend/src/controllers/contract.controller');
console.log('Controller keys:', Object.keys(contractController));
if (!contractController.sendBackToOwner) {
  console.error('ERROR: sendBackToOwner is UNDEFINED');
} else {
  console.log('SUCCESS: sendBackToOwner is defined');
}
if (!contractController.activateContract) {
  console.error('ERROR: activateContract is UNDEFINED');
} else {
  console.log('SUCCESS: activateContract is defined');
}
