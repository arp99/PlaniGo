import axios from "axios";
import { logout } from "../utils";
import { toast } from "react-toastify";

const config = {
  baseURL: process.env.REACT_APP_API_BASE_URL,
};

let headers = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

let securedHeaders = {
  ...headers,
  authorization: `Bearer ${localStorage.getItem("token")}`,
};

let fileUploadHeaders = {
  ...securedHeaders,
  "Content-Type": "multipart/form-data",
};

const errorCalback = (error) => {
  const { response } = error;
  if (response.status === 403) {
    toast.error(`${response.data.message}, Logging out`);
    setTimeout(() => {
      logout();
    }, 1600);
    return
  }
  return response
};

const axiosInstance = axios.create({
  baseURL: config.baseURL,
  headers: securedHeaders,
});

axiosInstance.interceptors.response.use((response) => response, errorCalback);

const sprintAxiosInstance = axios.create({
  baseURL: config.baseURL + "v1/sprints",
  headers: securedHeaders,
});

sprintAxiosInstance.interceptors.response.use(
  (response) => response,
  errorCalback
);


const downloadFileInstance = axios.create({
  baseURL: config.baseURL + "v1",
  headers: securedHeaders,
});

downloadFileInstance.interceptors.response.use(
  (response) => response,
  errorCalback
);

export const EngineeringAPI = {
  loginUser(data) {
    return axiosInstance.post("/login", {
      ...data,
    });
  },
}

export const SprintPlanningAPI = {
  GET: {
    getSprintInfo() {
      return sprintAxiosInstance.get("/");
    },
    getSprintByStatus({ status }) {
      return sprintAxiosInstance.get(`/?status=${status}`);
    },
    getSprintById({ sprintId }) {
      return sprintAxiosInstance.get(`/${sprintId}?expand=true`);
    },
    getMilestonesOfSprint({ sprintId }) {
      return sprintAxiosInstance.get(`/${sprintId}/milestones?expand=true`);
    },
    getMilestonebyStatus({ sprintId, status }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones?status=${status}`
      );
    },
    getMilestonebyId({ sprintId, milestoneId }) {
      return sprintAxiosInstance.get(`/${sprintId}/milestones/${milestoneId}`);
    },
    getTasksInMilestone({ sprintId, milestoneId }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks`
      );
    },
    getTaskById({sprintId, milestoneId, taskId}){
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}`
      )
    },
    getTasksInMilestoneByStatus({ sprintId, milestoneId, status }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks?status=${status}`
      );
    },
    getTaskInMilestoneById({ sprintId, milestoneId, taskId }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}`
      );
    },
    getCommentsInTask({ sprintId, milestoneId, taskId }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/comments`
      );
    },
    getCommentInTaskById({ sprintId, milestoneId, taskId, commentId }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/comments/${commentId}`
      );
    },
    getAttachmentsInTask({ sprintId, milestoneId, taskId }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/attachments`
      );
    },
    getAttachmentInTaskById({ sprintId, milestoneId, taskId, attachmentId }) {
      return sprintAxiosInstance.get(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/attachments/${attachmentId}`
      );
    },

    getSprintUsers() {
      return axiosInstance.get("/v1/sprintusers");
    },

    downloadImage({ fileKey }) {
      return downloadFileInstance.get(`/view/images/${fileKey}`, {
        responseType: "blob",
      });
    },
  },
  POST: {
    createNewSprint({ sprintBody }) {
      return sprintAxiosInstance.post("/", {
        ...sprintBody,
      });
    },
    createNewMilestone({ sprintId, milestoneBody }) {
      return sprintAxiosInstance.post(`/${sprintId}/milestones`, {
        ...milestoneBody,
      });
    },

    createNewTask({ sprintId, milestoneId, taskBody }) {
      return sprintAxiosInstance.post(
        `/${sprintId}/milestones/${milestoneId}/tasks`,
        {
          ...taskBody,
        }
      );
    },
    moveTaskToMilestone({ sprintId, milestoneId, taskId, selectedMilestoneId }) {
      return sprintAxiosInstance.post(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/move-to-milestone/${selectedMilestoneId}`
      );
    },
    moveMultipleTasksToMilestone({ sprintId, milestoneId, selectedMilestoneId, taskIdList }) {
      console.log(taskIdList, "task iddd lissst gegegge")
      return sprintAxiosInstance.post(
        `/${sprintId}/milestones/${milestoneId}/tasks/move-multiple-tasks/${selectedMilestoneId}`,{
          taskIdList: taskIdList
        }
      );
    },
    createNewComment({ sprintId, milestoneId, taskId, commentBody }) {
      return sprintAxiosInstance.post(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/comments`,
        {
          ...commentBody,
        }
      );
    },

    createNewAttachment({ sprintId, milestoneId, taskId, attachmentBody }) {
      return sprintAxiosInstance.post(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/attachments`,
        {
          ...attachmentBody,
        }
      );
    },

  },
  PUT: {
    updateSprint({ sprintId, sprintBody }) {
      return sprintAxiosInstance.put(`/${sprintId}`, {
        ...sprintBody,
      });
    },
    updateMilestone({ sprintId, milestoneId, milestoneBody }) {
      return sprintAxiosInstance.put(`/${sprintId}/milestones/${milestoneId}`, {
        ...milestoneBody,
      });
    },

    updateTask({ sprintId, milestoneId, taskId, taskBody }) {
      return sprintAxiosInstance.put(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}`,
        {
          ...taskBody,
        }
      );
    },

    updateComment({ sprintId, milestoneId, taskId, commentId, commentBody }) {
      return sprintAxiosInstance.put(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/comments/${commentId}`,
        {
          ...commentBody,
        }
      );
    },

    updateAttachment({
      sprintId,
      milestoneId,
      taskId,
      attachmentId,
      attachmentBody,
    }) {
      return sprintAxiosInstance.put(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/attachments/${attachmentId}`,
        {
          ...attachmentBody,
        }
      );
    },
  },
  DELETE: {
    deleteSprint({ sprintId }) {
      return sprintAxiosInstance.delete(`/${sprintId}`);
    },
    deleteMilestone({ sprintId, milestoneId }) {
      return sprintAxiosInstance.delete(
        `/${sprintId}/milestones/${milestoneId}`
      );
    },

    deleteTask({ sprintId, milestoneId, taskId }) {
      return sprintAxiosInstance.delete(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}`
      );
    },

    deleteComment({
      sprintId,
      milestoneId,
      taskId,
      commentId,
      deletedByEmail,
    }) {
      return sprintAxiosInstance.delete(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/comments/${commentId}`,
        {
          data: { deletedByEmail },
        }
      );
    },

    deleteAttachment({ sprintId, milestoneId, taskId, attachmentId }) {
      return sprintAxiosInstance.delete(
        `/${sprintId}/milestones/${milestoneId}/tasks/${taskId}/attachments/${attachmentId}`
      );
    },
  },
  PATCH: {
    moveMilestoneAcrossSprint({ sprintId, milestoneId, selectedSprintId }){
      return sprintAxiosInstance.patch(`/${sprintId}/milestones/${milestoneId}/move-to-sprint/${selectedSprintId}`)
    }
  }
};
