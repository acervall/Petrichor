import { useQuery, UseQueryResult, UseMutationResult, useMutation } from 'react-query'
import axios from 'axios'
import { useLocalStorageId } from './userStore'
import { Folder } from '../lib/types'

export const fetchFolders = async (userId?: number | string) => {
  if (userId === undefined) return null
  try {
    const response = await axios.get(`/api/folder`, {
      headers: { 'user-id': userId.toString() },
    })
    // console.log('Successfully fetched all folders: ', response.data)
    return response.data
  } catch (error) {
    console.error('Error fetching data: ', error)
    throw error
  }
}

export const useFolders = (): UseQueryResult<Folder[], Error> => {
  const storageUser = useLocalStorageId()
  const userId = storageUser.data

  return useQuery('folders', () => fetchFolders(userId), { enabled: !!userId })
}

export const createFolder = async (userId: number, folderName: string) => {
  try {
    const response = await axios.post(
      `/api/folder/`,
      { name: folderName },
      {
        headers: {
          'user-id': userId.toString(),
        },
      },
    )
    // console.log('Folder created: ', response.data)
    return response.data
  } catch (error) {
    console.error('Error creating folder: ', error)
    throw error
  }
}

export const useCreateFolder = (): UseMutationResult<Folder, Error, { userId: number; folderName: string }> => {
  return useMutation((params: { userId: number; folderName: string }) => createFolder(params.userId, params.folderName))
}

export const deleteFolder = async ({ userId, id }: { userId: number; id: number }) => {
  try {
    await axios.delete(`/api/folder/${id}`, {
      headers: { 'user-id': userId.toString() },
    })
    // console.log('Successfully deleted folder!')
  } catch (error) {
    console.error('Error deleting folder: ', error)
    throw error
  }
}

export const useDeleteFolder = (): UseMutationResult<void, Error, { userId: number; id: number }> => {
  return useMutation(deleteFolder)
}
