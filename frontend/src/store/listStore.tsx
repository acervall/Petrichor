import { useQuery, UseQueryResult } from 'react-query'
import axios from 'axios'
import { useContext } from 'react'
import Context from '../util/ Context'
import { ListDataId, ErrorObject } from '../lib/types'

const fetchList = async (listId: number, userId: number): Promise<ListDataId | undefined> => {
  try {
    const response = await axios.post<ListDataId>(`/api/list`, {
      listId: listId,
      userId: userId,
    })
    // console.log('response.data', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

export const useList = (listId: number, userId: number): UseQueryResult<ListDataId, ErrorObject> => {
  return useQuery('list', () => fetchList(listId, userId))
}

const fetchToDoList = async (userId: number | undefined): Promise<ListDataId | undefined> => {
  if (userId) {
    try {
      const response = await axios.post<ListDataId>(`/api/list/home`, {
        id: userId,
      })
      localStorage.setItem(`list_${response.data.listId}`, JSON.stringify(response.data))
      return response.data
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }
}

export const useToDoList = (): UseQueryResult<ListDataId, ErrorObject> => {
  const { userId } = useContext(Context)
  return useQuery('list', () => fetchToDoList(userId))
}
