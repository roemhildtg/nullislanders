const pg = require('pg')
const { databaseConfig, } = require('../helpers/database')
const timeAgo = require('node-time-ago')

const pool = new pg.Pool(databaseConfig)
const { all, create, find, } = require('./post-queries')

exports.all = async () => {
  const selectAllQuery = all
  const queryResponse = await pool.query(selectAllQuery)
  const { rows: posts, } = queryResponse
  posts.map(i => (i.created_at = timeAgo(i.created_at)))
  return posts
}

exports.find = async params => {
  const { id, } = params
  const findQuery = find(id)
  const queryResponse = await pool.query(findQuery)
  const { rows: post, } = queryResponse
  return post
}

exports.create = async params => {
  // TODO: FILTER OUT NON-URI's
  const createNewQuery = create(params)
  const queryResponse = await pool.query(createNewQuery)
  const { rows: post, } = queryResponse

  return post
}
