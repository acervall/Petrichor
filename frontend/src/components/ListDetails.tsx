import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
// import { getSessionStorageItem } from '../lib/sessionStorage'
import { useLocalStorageId } from '../store/userStore'

interface Task {
  id: number
  name: string
  checked: boolean
}

interface ListData {
  listName: string
  tasks: Task[]
}

const ListDetails: React.FC = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const [listData, setListData] = useState<ListData | null>({
    listName: '',
    tasks: [],
  })
  const [newTaskName, setNewTaskName] = useState('')
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editedTaskName, setEditedTaskName] = useState<string>('')
  const [isEditingMode, setIsEditingMode] = useState(false)
  const [showEditButtons, setShowEditButtons] = useState(false)
  const [showDeleteButtons, setShowDeleteButtons] = useState(false)
  //const userId = getSessionStorageItem('userId')
  const storageUser = useLocalStorageId()
  const userId = storageUser.data

  useEffect(() => {
    const storedListData = sessionStorage.getItem(`list_${listId}`)

    const fetchList = async () => {
      try {
        if (!userId) return
        const response = await axios.get<ListData>(`/api/list/${listId}`, {
          headers: {
            'user-id': userId.toString(),
          },
        })
        const serverData = response.data
        const initialData = storedListData ? JSON.parse(storedListData) : serverData
        setListData(initialData)
        setEditingTaskId(null)
        setIsEditingMode(false)
        if (!storedListData) {
          localStorage.setItem(`list_${listId}`, JSON.stringify(serverData))
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchList()
  }, [listId, userId])

  const AddTask = async () => {
    try {
      if (!userId) return
      const response = await axios.post(
        `/api/list/${listId}/tasks`,
        { name: newTaskName },
        { headers: { 'user-id': userId.toString() } },
      )

      const updatedList = {
        ...listData!,
        tasks: [...(listData?.tasks || []), response.data],
      }

      setListData(updatedList)
      sessionStorage.setItem(`list_${listId}`, JSON.stringify(updatedList))

      setNewTaskName('')
    } catch (error) {
      console.error('Error adding task:', error)
    }
  }

  const DeleteTask = async (taskId: number) => {
    try {
      if (!userId) return
      await axios.delete(`/api/list/${listId}/tasks/${taskId}`, {
        headers: {
          'user-id': userId?.toString(),
        },
      })

      const updatedList = {
        ...listData!,
        tasks: listData?.tasks.filter((task) => task.id !== taskId) || [],
      }

      setListData(updatedList)
      sessionStorage.setItem(`list_${listId}`, JSON.stringify(updatedList))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const EditTask = (taskId: number) => {
    const taskToEdit = listData?.tasks.find((task) => task.id === taskId)
    if (taskToEdit) {
      setEditingTaskId(taskId)
      setEditedTaskName(taskToEdit.name)
      setIsEditingMode(true)
    }
  }

  const SaveEdit = async (taskId: number) => {
    if (!editedTaskName.trim()) {
      return
    }

    try {
      if (!userId) return
      await axios.put(
        `/api/list/${listId}/tasks/${taskId}`,
        {
          name: editedTaskName,
        },
        { headers: { 'user-id': userId?.toString() } },
      )

      const updatedList = {
        ...listData!,
        tasks: listData?.tasks.map((task) => (task.id === taskId ? { ...task, name: editedTaskName } : task)) || [],
      }

      setListData(updatedList)
      sessionStorage.setItem(`list_${listId}`, JSON.stringify(updatedList))

      setEditingTaskId(null)
      setEditedTaskName('')
      setIsEditingMode(false)
    } catch (error) {
      console.error('Error editing task:', error)
    }
  }

  const CancelEdit = () => {
    setEditingTaskId(null)
    setEditedTaskName('')
    setIsEditingMode(false)
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  if (!listData) {
    return <div>Loading...</div>
  }

  const handleCheck = (taskId: number) => {
    setListData((prevList) => {
      if (!prevList) {
        return prevList
      }
      console.log('prevList ListDetails', prevList)

      const updatedTasks = prevList.tasks.map((task) =>
        task.id === taskId ? { ...task, checked: !task.checked } : task,
      )

      updatedTasks.sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? -1 : 1))

      const updatedList = {
        ...prevList,
        tasks: updatedTasks,
      }

      sessionStorage.setItem(`list_${listId}`, JSON.stringify(updatedList))

      return updatedList
    })
  }

  return (
    <>
      <div onClick={handleGoBack} className="cursor-pointer p-4 text-xs text-stone-500">
        Go Back
      </div>
      <div className="m-10 mx-auto mt-10 max-w-lg p-2">
        <h1 className="text-m  pl-5 font-bold">{listData?.listName}</h1>
        <div className="">
          <div className="flex justify-end space-x-4 pr-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className=""
              onClick={() => setShowEditButtons(!showEditButtons)}
            >
              <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
              <polyline points="14 2 14 8 20 8" />
              <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z" />
            </svg>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="cursor-pointer text-black hover:text-red-500"
              onClick={() => setShowDeleteButtons(!showDeleteButtons)}
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>

          {listData.tasks.filter((task) => task.name !== null).length === 0 && !isEditingMode && (
            <div className="ml-5 text-xs text-red-500">No task found in this list</div>
          )}
        </div>
        {listData.tasks.length > 0 ? (
          <ul className="mt-4 space-y-4">
            {listData.tasks.map(
              (task) =>
                task.name && (
                  <li
                    key={task.id}
                    className={`mx-5 flex items-center justify-between rounded-md bg-stone-300 p-2 text-xs shadow-md hover:bg-stone-400 ${
                      task.checked ? 'checked-task' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.checked || false}
                      onChange={() => handleCheck(task.id)}
                      className="mr-2 rounded"
                    />
                    {isEditingMode && editingTaskId === task.id ? (
                      <>
                        <input
                          type="text"
                          value={editedTaskName}
                          onChange={(e) => setEditedTaskName(e.target.value)}
                          className="flex-grow rounded-md border border-gray-300 p-1 text-xs"
                        />
                        <button
                          onClick={() => SaveEdit(task.id)}
                          className="m-1 rounded-md bg-stone-500 px-2 py-1 text-xs text-white"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => CancelEdit()}
                          className="rounded-md bg-stone-500 px-2 py-1 text-xs text-white"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex w-full items-center justify-between space-x-2">
                          <span className="mr-2">{task.id === editingTaskId ? editedTaskName : task.name}</span>
                          <div className="flex items-center space-x-2">
                            {showDeleteButtons && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="cursor-pointer text-black hover:text-red-500"
                                onClick={() => DeleteTask(task.id)}
                              >
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                <line x1="9" y1="14" x2="15" y2="14" />
                              </svg>
                            )}
                            {showEditButtons && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  EditTask(task.id)
                                }}
                                className="rounded-md bg-stone-500 px-2 py-1 text-xs text-white"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </li>
                ),
            )}
          </ul>
        ) : (
          <div>Your list is empty, add tasks</div>
        )}
        {!isEditingMode && listData.tasks.length > 0 && (
          <div className="mt-4 flex items-center pb-10 pl-5 pr-5 text-xs">
            <input
              type="text"
              placeholder="Add task"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="mr-2 flex-grow rounded-md border border-gray-300 p-1 text-xs"
            />
            <button onClick={AddTask} className="rounded-md bg-stone-500 px-2 py-1 text-xs text-white">
              +
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export default ListDetails
