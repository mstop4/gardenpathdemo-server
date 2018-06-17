const sendResponse = (res, format, data, route) => {
  if (format === 'html') {
    data.status = 'ok'
    res.status(200).render(route, {
      data: data
    })
  } else if (format === 'json') {
    data.status = 'ok'
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(data))
  } else {
    res.status(400).send('Error: Unknown format')
  }
}

module.exports = sendResponse