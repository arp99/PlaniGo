import { getShortObjId } from "../../../../../helpers";
import { toast } from "react-toastify";
import { ToolTip } from "../../../../../components/Tooltip";
import deleteIcon from "../../../../../assets/delete.svg";
import shareIcon from "../../../../../assets/share.svg";
import { useSearchParams } from "react-router-dom";

export const TaskRow = ({
  task,
  initColumnState,
  viewFilters,
  setShowDeleteModal,
  toggleFullscreen,
  setShowViewModal,
  setEditableTask,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  return (
    <>
      <tr
        key={task._id}
        onClick={() => {
          setShowViewModal(true);
          setEditableTask(task);
          searchParams.set("taskId", task._id)
          setSearchParams(searchParams)
        }}
        className="task-detail-row"
      >
        <td>
        </td>
        <td className={`task-detail-item ${toggleFullscreen}`}>{task.name}</td>
        {initColumnState.slice(1).map((filteredAttr) => {
          if (viewFilters.includes(filteredAttr)) {
            let propertyName = filteredAttr.toLowerCase();
            if (propertyName === "id") {
              return (
                <td className="task-detail-item">
                  <p>{getShortObjId(task._id)}</p>
                </td>
              );
            }
            if (filteredAttr.includes(" ")) {
              let formattedWords = filteredAttr
                .split(" ")
                .slice(1)
                .reduce(
                  (acc, curr) =>
                    acc.concat(
                      curr.slice(0, 1).toUpperCase() +
                        curr.slice(1).toLowerCase()
                    ),
                  []
                );
              let joinWords = formattedWords.join("");
              propertyName =
                filteredAttr.split(" ")[0].toLowerCase() + joinWords;
            }
            return (
              <td className="task-detail-item">
                <p>{task[propertyName]}</p>
              </td>
            );
          }
          return null;
        })}
        <td className="task-detail-item mw-5">
          <div className="actions__container d-flex align-items-center gap-2">
            <ToolTip name={"Delete"}>
              <img
                src={deleteIcon}
                className="edit-icon"
                onClick={(evt) => {
                  evt.stopPropagation();
                  setShowDeleteModal({
                    taskId: task._id,
                    show: true,
                  });
                }}
              />
            </ToolTip>
            <ToolTip name={"Copy Link"}>
              <img
                src={shareIcon}
                className="edit-icon-sm"
                onClick={async (evt) => {
                  evt.stopPropagation();
                  await navigator.clipboard.writeText(
                    `${window.location.href}&taskId=${task._id}`
                  );
                  toast.success("Task Link has been Copied");
                }}
              />
            </ToolTip>
          </div>
        </td>
      </tr>
    </>
  );
};
