import React, { createContext, Component } from 'react'
import hash from 'hash-sum'
import { deepEqual } from 'fast-equals'
import debounce from 'lodash.debounce'

export default function initTableContext(requestData = () => Promise.resolve([])) {
  const TableContext = createContext()

  class TableProvider extends Component {
    constructor(props) {
      super(props)
      this.state = {
        page: 0,
        pageSize: 10,
        firstPage: true,
        isLoading: false,
        isEmpty: true,
        data: [],
        meta: {},
        error: null,
        filters: {},
        unappliedFilters: {},
        sorting: {},
        pageData: [],
        selected: [],
        search: ''
      }
      const { searchWait = 300 } = props

      this.getDataDebounced = debounce(this.getData, searchWait)
      this.key = hash(Date.now())
      this.cache = new Map()
    }

    static defaultProps = {
      onError: console.error,
      pageSize: 10,
      filters: {},
      selected: [],
      getCacheKey: state => hash(state),
    };

    componentDidMount() {
      const { pageSize, filters, selected } = this.props
      this.handleUpdate({ pageSize, filters, selected })
    }

    componentDidUpdate(prevProps) {
      const { selected, filters, autoApplyFilters } = this.props
      const isSame = this.checkIfSame(selected, prevProps.selected)
      if (!isSame) this.setState({ selected })

      const shouldApplyFilters = autoApplyFilters && !deepEqual(filters, prevProps.filters)
      if (shouldApplyFilters) this.setFilters(filters, true)
    }

    checkIfSame = (selected, prevSelected) => (
      selected.every(({ id }) => prevSelected.some(s => s.id === id))
      && prevSelected.every(({ id }) => selected.some(s => s.id === id))
    )

    handleUpdate = (newValues) => {
      const { page, pageSize, search, filters, sorting } = { ...this.state, ...newValues }
      const key = this.props.getCacheKey({
        page,
        pageSize,
        search,
        filters,
        sorting,
        key: this.key
      })

      if (this.cache.has(key)) {
        const newState = this.cache.get(key)
        this.setState({ ...newState, ...newValues })
      } else {
        this.setState(
          { isLoading: true, ...newValues }, 
          () => this.getDataDebounced({ ...this.state, ...newValues }, key)
        )
      }
    };

    getData = async (values, key) => {
      try {
        const response = await requestData(values)
        let data = []
        let meta = {}

        if (response.data && response.meta) {
          data = response.data
          meta = response.meta
        } else {
          data = response
          meta = { count: data.length }
        }

        if (!Array.isArray(data)) {
          throw new Error(
            `Invalid data provided. Expected array, but got ${typeof data}`
          )
        }

        this.setState(
          currentState => {
            const start = currentState.page * currentState.pageSize
            const end = start + currentState.pageSize

            return {
              ...currentState,
              data,
              meta,
              firstPage: currentState.page === 0,
              pageData: data.slice(start, end),
              isEmpty: data.length === 0,
              isLoading: false
            }
          },
          () => {
            const {
              firstPage,
              isEmpty,
              isLoading,
              pageData,
              unappliedFilters,
              meta,
              page,
              pageSize,
              search,
              filters
            } = this.state

            this.cache.set(key, {
              data: this.state.data,
              firstPage,
              isEmpty,
              isLoading,
              pageData,
              unappliedFilters,
              meta,
              page,
              pageSize,
              search,
              filters
            })
          }
        )
      } catch (error) {
        console.error('Init table context error: ', error)
        this.props.onError(error)
        this.setState({ error, isLoading: false })
      }
    }

    setSearch = search => this.handleUpdate({ search, page: 0 });

    setPage = page => this.handleUpdate({ page });

    setPageSize = pageSize => this.handleUpdate({ pageSize });

    setSelected = selected => {
      // NOTE: We do not want to refresh table if a item becomes selected.
      this.setState({ selected })
    };

    toggleSelectAll = type => {
      const { data, selected: currentSelection } = this.state
      const mustRemoveAll = data.every(({ id }) => currentSelection.some(s => s.id === id))

      const checkedRows = mustRemoveAll
        ? currentSelection.filter(({ id }) => !data.some(d => d.id === id))
        : [...currentSelection, ...data]

      const filteredRows = checkedRows.filter(
        ({ id }, index) => checkedRows.findIndex(r => r.id === id) === index
      )

      const selected = type
        ? filteredRows.map(row => ({
          ...row,
          tableName: row.tableName || type
        }))
        : filteredRows

      this.setState({ selected })
    };

    setFilters = (filters, clearData = false) => {
      const { data } = this.state
      this.handleUpdate({
        filters,
        unappliedFilters: filters,
        page: 0,
        data: clearData ? [] : data
      })
    };

    setUnappliedFilters = filters => {
      this.setState({
        unappliedFilters: filters
      })
    };

    applyFilters = () => {
      const { unappliedFilters } = this.state
      this.setFilters(unappliedFilters)
    };

    setSorting = sorting => this.handleUpdate({ sorting });

    refresh = () => {
      this.handleUpdate()
    };

    render() {
      const value = {
        ...this.state,
        setSearch: this.setSearch,
        setPage: this.setPage,
        setSorting: this.setSorting,
        setPageSize: this.setPageSize,
        refresh: this.refresh,
        setSelected: this.setSelected,
        toggleSelectAll: this.toggleSelectAll,
        setFilters: this.setFilters,
        setUnappliedFilters: this.setUnappliedFilters,
        applyFilters: this.applyFilters
      }

      return (
        <TableContext.Provider value={value}>
          {this.props.children}
        </TableContext.Provider>
      )
    }
  }

  return [TableProvider, TableContext.Consumer]
}