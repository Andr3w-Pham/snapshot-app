// if production use MLAB else use local DB
if (process.env.NODE_ENV === "production") {
  module.exports = {mongoURI: 'mongodb://hero:a1b2c3@ds151402.mlab.com:51402/snap-shot'}
} else {
  module.exports = {mongoURI: "mongodb://localhost/post-dev"}
}
