
# @lessondesk/react-table-context
[![package version](https://img.shields.io/npm/v/@lessondesk/react-table-context.svg?style=flat-square)](https://npmjs.org/package/@lessondesk/react-table-context)
[![package downloads](https://img.shields.io/npm/dm/@lessondesk/react-table-context.svg?style=flat-square)](https://npmjs.org/package/@lessondesk/react-table-context)
[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![package license](https://img.shields.io/npm/l/@lessondesk/react-table-context.svg?style=flat-square)](https://npmjs.org/package/@lessondesk/react-table-context)
[![make a pull request](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

> Flexible Table Provider & Consumer

## Table of Contents

- [Usage](#usage)
- [Install](#install)
- [Contribute](#contribute)
- [License](#License)

## Usage

```js
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

```


## Install

This project uses [node](https://nodejs.org) and [npm](https://www.npmjs.com).

```sh
$ npm install @lessondesk/react-table-context
$ # OR
$ yarn add @lessondesk/react-table-context
```

## Contribute

1. Fork it and create your feature branch: `git checkout -b my-new-feature`
2. Commit your changes: `git commit -am "Add some feature"`
3. Push to the branch: `git push origin my-new-feature`
4. Submit a pull request

## License

MIT
