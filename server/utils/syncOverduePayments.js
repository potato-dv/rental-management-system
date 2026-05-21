const Payment = require("../models/Payment");

const syncOverduePayments = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  await Payment.updateMany(
    {
      status: { $in: ["pending", "unpaid"] },
      dueDate: { $lt: todayStart },
      paidDate: null,
      proofOfPayment: { $in: [null, ""] },
    },
    {
      $set: { status: "overdue" },
    },
  );

  await Payment.updateMany(
    {
      status: "unpaid",
      $or: [
        { dueDate: { $gte: todayStart } },
        { paidDate: { $exists: true, $ne: null } },
        { proofOfPayment: { $exists: true, $nin: [null, ""] } },
      ],
    },
    {
      $set: { status: "pending" },
    },
  );

  await Payment.updateMany(
    {
      status: "overdue",
      $or: [
        { dueDate: { $gte: todayStart } },
        { paidDate: { $exists: true, $ne: null } },
        { proofOfPayment: { $exists: true, $nin: [null, ""] } },
      ],
    },
    {
      $set: { status: "pending" },
    },
  );
};

module.exports = {
  syncOverduePayments,
};
