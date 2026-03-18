import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'usd',
    },
    method: {
      type: String,
      enum: ['stripe', 'paypal', 'other'],
      default: 'stripe',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    stripePaymentIntentId: String,
    transactionId: String,
    failureReason: String,
    refundAmount: {
      type: Number,
      default: 0,
    },
    refundedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
