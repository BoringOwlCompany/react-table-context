import React from 'react'
import ReactDOM from 'react-dom'

import createTableContext from './react-table-context'

const Table = () => {
  const [Provider, Consumer] = createTableContext(async args => {
    console.log('args', args)

    const response = await fetch('https://jsonplaceholder.typicode.com/todos')
    const json = await response.json()

    return {
      meta: {
        count: json.length
      },
      data: json
    }
  })

  return <Provider>
    <div>
      <h1>Example Table</h1>
      <Consumer>
        {({
          page, // 0
          pageSize, // 10
          firstPage, // true
          isLoading, // false
          isEmpty, // false
          data, // Array[100]
          meta, // Object
          error, // null
          filters, // Object
          unappliedFilters, // Object
          sorting, // Object
          pageData, // Array[10]
          selected, // Array[0]
          search, //
          setSearch, // function () {}
          setPage, // function () {}
          setSorting, // function () {}
          setPageSize, // function () {}
          refresh, // function () {}
          setSelected, // function () {}
          toggleSelectAll, // function () {}
          setFilters, // function () {}
          setUnappliedFilters, // function () {}
          applyFilters // function () {}
        }) => {
          console.log('data', data)
          return <table>
            <thead>
              <tr>

                <th>ID</th>
                <th>Title</th>
                <th>Completed</th>
              </tr>
            </thead>
            <tbody>
              {pageData.map(({ id, title, completed }) => {
                return <tr key={id}>
                  <td>{id}</td>
                  <td>{title}</td>
                  <td>{completed ? 'Yes' : 'Nope'}</td>
                </tr>
              })}
            </tbody>
          </table>
        }}
      </Consumer>
    </div>
  </Provider>
}

function App () {
  return (
    <div className='App'>
      <Table />
    </div>
  )
}

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
