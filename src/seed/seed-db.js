import { create, apolloClient, seedServerHost as host } from './factories'
import { authenticatedHeaders } from '../jest/helpers.js'
import gql from 'graphql-tag'
import asyncForEach from '../helpers/asyncForEach'
import seed from './data'

(async function () {

  // prefer factories
  try {
  const [admin, moderator, user, ...otherUsers] = await Promise.all([
      create('user', {id: 'u1', name: 'Peter Lustig'      , role: 'admin'    , email: 'admin@example.org', password: '1234'}),
      create('user', {id: 'u2', name: 'Bob der Baumeister', role: 'moderator', email: 'moderator@example.org'}),
      create('user', {id: 'u3', name: 'Jenny Rostock'     , role: 'user'     , email: 'user@example.org'}),
      create('user', {id: 'u4', name: 'Angie Banjie'      , role: 'user'     , email: 'angie@example.org'}),
    ])

    // TODO: other users, not only admin, are authors of a post
    const headers = await authenticatedHeaders({
      email: 'admin@example.org',
      password: '1234'
    }, host)
    await create('post', {id: 'p1'}, { headers } )
    await create('post', {id: 'p2'}, { headers } )
    await create('post', {id: 'p3'}, { headers } )
    await create('post', {id: 'p4'}, { headers } )
    await create('post', {id: 'p5'}, { headers } )
    await create('post', {id: 'p6'}, { headers } )
  } catch(err) {
    /* eslint-disable-next-line no-console */
    console.error(err)
    process.exit(1)
  }


let data = {}
  // legacy seeds
  await asyncForEach(Object.keys(seed), async key => {
    const mutations = seed[key]
    try {
      const res = await apolloClient
        .mutate({
          mutation: gql(mutations(data))
        })
      data[key] = Object.assign(data[key] || {}, res.data)
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(err)
      process.exit(1)
    }
  })
  /* eslint-disable-next-line no-console */
  console.log('Seeded Data...')
})()

