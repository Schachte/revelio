import React from 'react'
import Routes from '../../webapp/routes'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { getDataFromTree } from '@apollo/react-ssr'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheets } from '@material-ui/core/styles'
import { createClient } from '../../webapp/intrigue-api/graphql'
import { ApolloProvider } from '@apollo/react-hooks'

const whitelistedSSRRoutes = [
  '/',
  '/search/catalog',
  '/search/catalog/',
  '/search/catalog/search',
]

export default (req, res, next) => {
  if (whitelistedSSRRoutes.includes(req.originalUrl)) {
    executeSSR(req, res, next)
  } else {
    next()
  }
}

const executeSSR = (req, res, next) => {
  // TODO: Add client vs server initialization logic in client creator
  // const client = initApolloClient({ isClient: false })
  const sheets = new ServerStyleSheets()
  const client = createClient()

  const App = sheets.collect(
    <ApolloProvider client={client}>
      <StaticRouter
        location={req.originalUrl}
        basename="/search/catalog"
        context={{}}
      >
        <Routes />
      </StaticRouter>
    </ApolloProvider>
  )

  const Html = ({ content, state, css }) => {
    return (
      <html>
        <head>
          {/* TODO: Update clientside to remove + inject CSS */}
          <style id="css-server-side">${css}</style>
        </head>
        <body style={{ margin: 0 }}>
          <div id="root" dangerouslySetInnerHTML={{ __html: content }} />
          <script src={req.clientBundle}></script>
        </body>
      </html>
    )
  }

  return getDataFromTree(App).then(() => {
    // Don't need both render markup and render string (remove)
    const content = renderToString(App)
    const styling = sheets.toString()
    const initialState = client.extract()
    const html = <Html content={content} state={initialState} css={styling} />
    const response = `<!doctype html>\n${renderToStaticMarkup(html)}`
    res.send(response)
    res.end()
  })
}
