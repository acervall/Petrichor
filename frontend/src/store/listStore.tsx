import { useQuery, UseQueryResult } from 'react-query'
import axios from 'axios'
import { BASE_URL } from '../lib/constants'

// import { useState, useEffect } from 'react'

// export const useList = () => {
//   const [todoList, setTodoList] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const fetchTodoList = async () => {
//       try {
//         const response = await axios.get('/api/list/1')
//         console.log('response.data USEEFFECT', response.data)
//         setTodoList(response.data)
//       } catch (error) {
//         console.error('Error fetching data:', error)
//         setError(error)
//       }
//     }

//     fetchTodoList()
//   }, [])

//   return { todoList, loading, error }
// }

interface Task {
  id: number
  name: string
}

interface ListData {
  listName: string
  tasks: Task[]
}

interface ErrorObject {
  message: string
}

const fetchTodoList = async (): Promise<ListData | undefined> => {
  const userId = 2
  try {
    const response = await axios.post<ListData>(`${BASE_URL}/api/list`, {
      listId: 1,
      userId: userId,
    })
    console.log('response.data', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }

  // const response = await axios.get<ListData>(`${BASE_URL}/api/list`)
  // console.log('response.data', response.data)

  // return response.data
}

export const useTodoList = (): UseQueryResult<ListData, ErrorObject> => {
  console.log('USEQUERY')

  return useQuery('todoList', fetchTodoList)
}

// export const createList = () => { return useMutation(
//   (newListName) =>
//     axios.post(`${BASE_URL}/api/list/${listId}`, {
//       name: newTaskName,
//     }),
//   {
//     onSuccess: (data, variables) => {

//       queryClient.setQueryData(['list', listId], (prevList: ListData | null) => ({
//         ...prevList!,
//         tasks: [...(prevList?.tasks || []), data],
//       }));
//     },
//     onError: (error) => {
//       console.error('Error adding task:', error);
//     },
//   }
// )}