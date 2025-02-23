const { redisClient } = require('../../../../config/redis');
const { getSocketInstance } = require('../../../../socket');
const io = getSocketInstance();

const emitMasterReqApprovalAdded = async (request) => {
  io.emit("masterReqApprovalAdded", request);
};

const emitMasterReqApprovalUpdated = async (master) => {
  io.emit("masterReqApprovalAdded", master);
  await redisClient.hSet('masters:request:approval', master.id.toString(), JSON.stringify(master));
};

module.exports = {
  emitMasterReqApprovalAdded,
  emitMasterReqApprovalUpdated
};