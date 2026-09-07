const dbs = {};
const functions = {

    xyz : `function xyz() {
    const domain = "example.com";
  const randomPart = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now();
  return "user5@example.com";
}
`
};


module.exports = {dbs , functions};