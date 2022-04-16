require('dotenv').config()
const { fbRest } =require('../firebase/firebase-rest')
const fetch = require('node-fetch')
const fbDatabase = fbRest()
async function getGoogleToken() {
 try {
   

  debugger;
  const selectedWorkspace = process.env.selectedWorkspace

  const { inc: currenttimestamp } = await fbDatabase.ref("/").update({ inc: { ".sv": "timestamp" } })
  const issuetime = parseInt(process.env.google_expires_in) * 1000 + parseInt(process.env.google_timestamp)
  debugger;
  if (issuetime<currenttimestamp) {
    debugger;
    //refresh token
    console.log('process.env.google_refresh_token_2......',process.env.google_refresh_token)
    const fetchpath = `https://workflow-runner.netlify.app/.netlify/functions/google-refresh?refresh_token=${process.env.google_refresh_token}`
    debugger;
    const authresponse = await fetch(fetchpath, { method: 'GET', headers: { 'User-Agent': 'node.js', 'Content-Type': 'application/json' } })
    console.log('authresponse.ok',authresponse.ok)
    console.log('authresponse',authresponse)
    debugger;
    let authData = await authresponse.json()
    debugger;
    console.log('authData!!!!!!!!!!!!!!!!!',authData)
    const update = { timestamp: { '.sv': "timestamp" }, ...authData }
    const path = `oauth/users/${process.env.localId}/workspaces/${selectedWorkspace}/auth/google`

    const data = await fbDatabase.ref(path).update(update)

    process.env.google_access_token = authData.access_token
    process.env.google_refresh_token = authData.refresh_token ?   authData.refresh_token :  process.env.google_refresh_token
    process.env.google_expires_in = authData.expires_in
    process.env.google_timestamp = data.timestamp
    return process.env.google_access_token
    //update firebase
  } else {
    debugger;
    //return access token
    return process.env.google_access_token
  }
} catch (error) {

   console.log('googleo auth error',error)
}
}

module.exports = { getGoogleToken }