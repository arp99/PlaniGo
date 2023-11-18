const express = require("express");
const { isAuthenticated } = require("../../../middlewares/authentication");
const {
  createNewTask,
  getTasksInMilestone,
  getTaskById,
  deleteTaskById,
  updateTask,
  taskTransfer,
  multipleTasksTransfer,
} = require("../../../controllers/Task/task.controller");
const commentRouter = require("../Comment/Comment.router");
const attachmentRouter = require("../Attachment/Attachment.router");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .post(isAuthenticated, createNewTask)
  .get(isAuthenticated, getTasksInMilestone);

router
    .route("/:taskId/transfer-task").post(isAuthenticated, taskTransfer);

router
  .route("/:taskId")
  .get(isAuthenticated, getTaskById)
  .put(isAuthenticated, updateTask)
  .delete(isAuthenticated, deleteTaskById);


router
  .route("/:taskId/move-to-milestone/:selectedMilestoneId")
  .post(isAuthenticated, taskTransfer);

router
  .route("/move-multiple-tasks/:selectedMilestoneId")
  .post(isAuthenticated, multipleTasksTransfer);

router.use("/:taskId/comments", commentRouter);
router.use("/:taskId/attachments", attachmentRouter);

module.exports = router;
