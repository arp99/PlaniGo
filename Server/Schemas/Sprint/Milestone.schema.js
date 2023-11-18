const { Schema, Types } = require("mongoose");

const MilestoneSchema = new Schema(
  {
    _id: {
      type: Types.ObjectId,
      required: [true, "Milestone id required"],
      auto: true,
    },
    name: {
      type: String,
      trim: true,
      requried: [true, "Milestone name required"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Milestone description required"],
    },
    status: {
      type: String,
      uppercase: true,
      enum: ["ACTIVE", "BACKLOG", "DEV", "QA", "PROD"],
      required: [true, "Sprint status required"],
    },
    tasksDoneCount: {
      type: Number,
      default: 0,
    },
    tasks: [
      {
        type: Types.ObjectId,
        ref: "task",
      },
    ],
    // milestone can be part of multiple releases
    releaseInfo: [
      {
        releaseName: {
          type: String,
        },
        releaseDate: {
          type: String,
        },
        releaseId: {
          type: Types.ObjectId,
        },
        _id: {
          type: Types.ObjectId,
          auto: true,
        },
      },
    ],
  },
  { timestamps: { createdAt: "cts", updatedAt: "mts" } }
);

module.exports = { MilestoneSchema };
