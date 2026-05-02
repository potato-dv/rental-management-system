const Payment = require("../models/Payment");

const syncOverduePayments = async () => {
  await Payment.updateMany(
    {
      status: "pending",
      dueDate: { $lt: new Date() },
    },
    {
      $set: { status: "overdue" },
    },
  );
};

module.exports = {
  syncOverduePayments,
};
