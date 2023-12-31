const express = require('express')
const router = express.Router()
const client = require('../connection')

const getUserIdFromHeaders = (request) => {
  const userId = request.headers['user-id']
  return userId
}

// GET see all lists
router.get('/', async (request, response) => {
  try {
    const userId = getUserIdFromHeaders(request)
    console.log('userId:', userId)
    const { rows } = await client.query('SELECT * FROM lists WHERE user_id = $1', [userId])
    response.send(rows)
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

router.post('/home', async (request, response) => {
  const { id } = request.body
  try {
    const { rows } = await client.query(
      `WITH homepage_list AS (
        SELECT id
        FROM lists
        WHERE user_id = $1 AND homepage = true
        LIMIT 1
      )
      SELECT lists.name as list_name, tasks.*
      FROM lists
      LEFT JOIN tasks ON lists.id = tasks.list_id
      JOIN users ON lists.user_id = users.id
      JOIN homepage_list ON lists.id = homepage_list.id
      WHERE users.id = $1;`,
      [id],
    )
    if (rows.length === 0) {
      console.log('ROWS', rows)
      response.status(404).json({ error: 'List not found' })
    } else {
      const listData = {
        listName: rows[0].list_name,
        listId: rows[0].list_id,
        tasks: rows.map((row) => ({ id: row.id, name: row.name })),
      }
      response.json(listData)
    }
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// GET a list by id
router.get('/:id', async (request, response) => {
  const userId = getUserIdFromHeaders(request)
  console.log('userId:', userId)
  const { id } = request.params
  const listId = parseInt(id, 10)

  try {
    const { rows } = await client.query(
      `
      SELECT lists.name as list_name, tasks.*
      FROM lists
      LEFT JOIN tasks ON lists.id = tasks.list_id
      WHERE lists.id = $1 AND lists.user_id = $2
      `,
      [listId, userId],
    )

    if (rows.length === 0) {
      response.status(404).json({ error: 'List not found' })
    } else {
      const listData = {
        listName: rows[0].list_name,
        tasks: rows.map((row) => ({ id: row.id, name: row.name })),
      }
      response.json(listData)
    }
  } catch (error) {
    console.error('Error:', error)
    response.status(500).json({ error: error.message })
  }
})

// DELETE delete a list
router.delete('/:listId', async (request, response) => {
  try {
    const userId = getUserIdFromHeaders(request)
    console.log('userId:', userId)
    const listId = parseInt(request.params.listId)

    const checkListQuery = 'SELECT * FROM lists WHERE id = $1 AND user_id = $2'
    const checkListResult = await client.query(checkListQuery, [listId, userId])

    if (checkListResult.rows.length === 0) {
      return response.status(404).json({ error: 'List not found' })
    }

    const deleteListQuery = 'DELETE FROM lists WHERE id = $1'
    await client.query(deleteListQuery, [listId])

    response.status(204).send()
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// PUT update a list
router.put('/:listId', async (request, response) => {
  try {
    const userId = getUserIdFromHeaders(request)
    console.log('userId:', userId)
    const listId = parseInt(request.params.listId)
    const { name, folder_id } = request.body

    const checkListQuery = 'SELECT * FROM lists WHERE id = $1 AND user_id = $2'
    const checkListResult = await client.query(checkListQuery, [listId, userId])

    if (checkListResult.rows.length === 0) {
      return response.status(404).json({ error: 'List not found' })
    }

    const updateListQuery = 'UPDATE lists SET name = $1, folder_id = $2 WHERE id = $3 RETURNING *'
    const updatedListResult = await client.query(updateListQuery, [name, folder_id, listId])

    response.status(200).json(updatedListResult.rows[0])
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// POST create a new list with user ID extracted from headers
router.post('/add', async (request, response) => {
  try {
    const userId = getUserIdFromHeaders(request)
    console.log('userId:', userId)
    const { name, folder_id } = request.body
    const { rows } = await client.query(
      'INSERT INTO lists (name, user_id, folder_id) VALUES ($1, $2, $3) RETURNING *',
      [name, userId, folder_id],
    )
    response.status(201).json(rows[0])
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// POST get a list and its tasks
router.post('/', async (_request, response) => {
  const { listId, userId } = _request.body
  try {
    const { rows } = await client.query(
      `
      SELECT lists.name as list_name, tasks.*
      FROM lists
      LEFT JOIN tasks ON lists.id = tasks.list_id
      JOIN users ON lists.user_id = users.id
      WHERE lists.id = $1 AND users.id = $2;
      `,
      [listId, userId],
    )

    if (rows.length === 0) {
      console.log('ROWS', rows)
      response.status(404).json({ error: 'List not found' })
    } else {
      const listData = {
        listName: rows[0].list_name,
        tasks: rows.map((row) => ({ id: row.id, name: row.name })),
      }
      response.json(listData)
    }
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// Tasks ned to fix

// POST new task
router.post('/:listId/tasks', async (request, response) => {
  try {
    const userId = getUserIdFromHeaders(request)
    console.log('userId:', userId)
    const listId = parseInt(request.params.listId)
    const { name } = request.body

    const validateListQuery = 'SELECT * FROM lists WHERE id = $1 AND user_id = $2'
    const validateListResult = await client.query(validateListQuery, [listId, userId])

    if (validateListResult.rows.length === 0) {
      return response.status(404).json({ error: 'List not found' })
    }

    const insertTaskQuery = 'INSERT INTO tasks (name, list_id) VALUES ($1, $2) RETURNING *'
    const insertTaskResult = await client.query(insertTaskQuery, [name, listId])

    response.status(201).json(insertTaskResult.rows[0])
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// PUT Update a task within a list
router.put('/:listId/tasks/:taskId', async (request, response) => {
  const userId = getUserIdFromHeaders(request)
  console.log('userId:', userId)

  const { taskId } = request.params
  const { name } = request.body

  try {
    const taskQuery = `
      UPDATE tasks
      SET name = $1
      FROM lists
      WHERE tasks.id = $2
        AND tasks.list_id = lists.id
        AND lists.user_id = $3
      RETURNING tasks.*;
    `

    const result = await client.query(taskQuery, [name, taskId, userId])

    if (result.rowCount === 0) {
      response.status(404).json({ error: 'Task not found or does not belong to the user.' })
    } else {
      response.json(result.rows[0])
    }
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

// DELETE task
router.delete('/:listId/tasks/:taskId', async (request, response) => {
  const userId = getUserIdFromHeaders(request)
  console.log('userId:', userId)
  const { listId, taskId } = request.params

  try {
    const deleteQuery = `
      DELETE FROM tasks
      WHERE id = $1
        AND list_id = $2
        AND list_id IN (SELECT id FROM lists WHERE user_id = $3)
      RETURNING *;
    `

    const result = await client.query(deleteQuery, [taskId, listId, userId])

    if (result.rowCount === 0) {
      response.status(404).json({ error: 'Task not found or does not belong to the user.' })
    } else {
      response.json({ message: 'Task deleted successfully.' })
    }
  } catch (error) {
    console.error(error)
    response.status(500).json({ error: error.message })
  }
})

module.exports = router
