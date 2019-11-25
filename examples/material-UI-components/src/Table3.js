import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles, lighten } from '@material-ui/core/styles';
import MaUTable from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination';
import GetAppIcon from '@material-ui/icons/GetApp';
import DeleteIcon from '@material-ui/icons/Delete';
import SearchIcon from '@material-ui/icons/Search';
import FilterListIcon from '@material-ui/icons/FilterList';
import Tooltip from '@material-ui/core/Tooltip';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Input from '@material-ui/core/Input';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import XLSX from 'xlsx';

import { useTable, useSortBy, usePagination } from 'react-table';

import makeData from './makeData';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  title: {
    flex: '1 1 100%',
  },
}));



const useDownload = ({ data, columns, title }) => {
  const onClick = useCallback(() => {
    const textData = data.map(d => {
      return columns.map(c => {
        const getText = c.getText || c.accessor;
        return getText(d);
      });
    });
    const header = columns.map(col => col.Header);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...textData]);
    const newWorkbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWorkbook, worksheet, 'SheetJS');
    XLSX.writeFile(newWorkbook, `${title}_EXPORT.xlsx`);
  }, [ data, columns, title ])

  const downloadButton = useMemo(() => (
    <Tooltip title="Download Excel">
      <IconButton aria-label="Download Excel" onClick={onClick}>
        <GetAppIcon />
      </IconButton>
    </Tooltip>
  ), [ onClick ]);

  return { downloadButton };
}

const useColumnFilter = ({ columns }) => {
  const ITEM_HEIGHT = 48;
  const [anchorEl, setAnchorEl] = useState(null);
  const [ filtered, setFiltered ] = useState(columns);
  useEffect(() => {
    setFiltered(filtered => filtered.map(c => { c.show = true; return c; }));
  }, [])
  const onChange = name => () => {
    const columnIndex = filtered.findIndex(c => c.Header === name);
    const column = filtered[columnIndex];
    column.show = !column.show;
    setFiltered([...filtered.slice(0, columnIndex), column, ...filtered.slice(columnIndex + 1)]);
  }

  const PaperProps = {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5,
      width: 200,
    },
  };

  const onClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const onClose = () => {
    setAnchorEl(null);
  }

  const shouldDisabled = (name) => {
    const left = filtered.filter(c => c.show === true);
    if(left.length === 1 && left[0].Header === name){
      return true;
    } else {
      return false;
    }
  }

  const filterButton = useMemo(() => {
    return (
      <>
        <Tooltip title="Filter Column">
          <IconButton aria-label="Filter Column" onClick={onClick} >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} keepMounted={true} onClose={onClose} PaperProps={PaperProps}>
          {filtered.map((column) => (
            <ListItem key={column.Header} role={undefined} dense button onClick={onChange(column.Header)} disabled={shouldDisabled(column.Header)}>
              <Checkbox checked={column.show !== false} />
              <ListItemText primary={column.Header} />
            </ListItem>
          ))}
        </Menu>
      </>
    )
  });

  return { filterButton, filtered };
}

const useSelect = ({ data, getRowId }) => {
  const [ selected, setSelected ] = useState([]);
  
  const onSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(data);
      return;
    }
    setSelected([]);
  }
  const headerCell = useMemo(() => {
    return (
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={selected.length > 0 && selected.length < data.length}
          checked={selected.length === data.length}
          onChange={onSelectAllClick}
          inputProps={{ 'aria-label': 'select all desserts' }}
        />
      </TableCell>
    )
  });
  
  const isRowSelected = row => {
    return selected.findIndex(s => getRowId(s) === getRowId(row)) !== -1
  }

  const rowCell = useCallback((row) => {
    return (
      <TableCell padding="checkbox">
        <Checkbox
          checked={isRowSelected(row)}
        />
      </TableCell>
    )
  })
  const onRowClick = row => {
    const selectedIndex = selected.findIndex(s => getRowId(s) === getRowId(row));
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, row);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  }

  // usually used after an action is processed
  const reset = () => { setSelected([]) };

  return { headerCell, rowCell, onRowClick, selectedRow: selected, resetSelectedRow: reset, isRowSelected };
}

export const MaterialTable = (props) => {
  const { columns: allColumns, data, rowsPerPage = 5, title, dense = true, download = true, columnFilter = true, selectable = false, selectOption = {} } = props;
  const [ columns, setColumns ] = useState(allColumns);
  const { makeToolbar, getRowId } = selectOption;

  if(selectable && (!makeToolbar || !getRowId)){
    console.warn("selectOption must be provided if table is selectable");
  }
  
  const classes = useToolbarStyles()

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    gotoPage,
    page,
    state,
    setPageSize
  } = useTable({
    columns,
    data,
    initialState: { pageIndex: 0 },
  }, useSortBy, usePagination);

  const { pageIndex, pageSize } = state[0];

  const emptyRows = pageSize - Math.min(pageSize, data.length - pageIndex * pageSize);
  
  useEffect(() => {
    setPageSize(rowsPerPage);
  }, [rowsPerPage, setPageSize]);

  
  const { downloadButton } = useDownload({ data, columns, title });

  const { filterButton, filtered: filteredColumn } = useColumnFilter({ columns });

  const { headerCell, onRowClick, rowCell, selectedRow, resetSelectedRow, isRowSelected } = useSelect({ data, getRowId });

  useEffect(() => {
    setColumns(filteredColumn);
  }, [filteredColumn, setColumns])
  
  const toolbar = (selectable && selectedRow.length > 0) ? makeToolbar({ selectedRow, resetSelectedRow }) : (<Toolbar className={classes.root}>
    <Typography variant="h6" className={classes.title}>
      {title}
    </Typography>
    { columnFilter && filterButton}
    { download && downloadButton }
  </Toolbar>)
  return (
    <>
      { toolbar }
      <MaUTable {...getTableProps()} stickyHeader={true} size={dense ? 'small' : 'medium'}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              { selectable && headerCell }
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <TableSortLabel
                    active={column.isSorted}
                    direction={column.isSortedDesc ? 'desc' : 'asc'}
                  >
                    {column.render('Header')}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {page.map(
            (row) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} selected={isRowSelected(row.original)} hover={true} onClick={selectable ? () => onRowClick(row.original) : () => {} }>
                  { selectable && rowCell(row.original)}
                  {row.cells.map(cell => {
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            }
          )}
          {emptyRows > 0 && (
            <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
              <TableCell colSpan={selectable ? columns.length + 1 : columns.length} />
            </TableRow>
          )}
        </TableBody>
      </MaUTable>
      <TablePagination
        component="div"
        rowsPerPageOptions={[]}
        count={data.length}
        rowsPerPage={pageSize}
        page={pageIndex}
        backIconButtonProps={{
          'aria-label': 'previous page',
        }}
        nextIconButtonProps={{
          'aria-label': 'next page',
        }}
        onChangePage={(event, currPage) => { gotoPage(currPage); }}
      />
    </>
  )
}

function App() {
  const columns = React.useMemo(
    () => [
      {
        Header: 'First Name',
        accessor: 'firstName',
        getText: d => d.firstName
      },
      {
        Header: 'Last Name',
        accessor: 'lastName',
        getText: d => d.lastName
      },
      {
        Header: 'Age',
        accessor: 'age',
        getText: d => d.age
      },
      {
        Header: 'Visits',
        accessor: 'visits',
        getText: d => d.visits
      },
      {
        Header: 'Status',
        accessor: 'status',
        getText: d => d.status
      },
      {
        Header: 'Profile Progress',
        accessor: 'progress',
        getText: d => d.progress
      },
    ],
    []
  )
  
  const data = React.useMemo(() => makeData(91), []);

  const useSelectToolbarStyles = makeStyles(theme => ({
    root: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
      color: theme.palette.secondary.main,
      backgroundColor: lighten(theme.palette.secondary.light, 0.85),
    },
    title: {
      flex: '1 1 100%',
    },
  }));

  const classes = useSelectToolbarStyles();
  const makeToolbar = ({ selectedRow, resetSelectedRow }) => {
    return (<Toolbar
      className={classes.root}
    >
      <Typography className={classes.title} color="inherit" variant="subtitle1">
        {selectedRow.length} selected
      </Typography>
      <Tooltip title="Delete">
        <IconButton aria-label="delete" onClick={() => console.log(selectedRow)}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reset">
        <IconButton aria-label="Reset" onClick={resetSelectedRow}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    </Toolbar>)
  }

  const selectOption = {
    makeToolbar,
    getRowId: r => `${r.firstName} ${r.lastName}`
  }
  return (
    <div>
      <CssBaseline />
      <MaterialTable columns={columns} data={data} title={'Class/Event'} download={true} selectable={true} selectOption={selectOption}/>
      <MaterialTable columns={columns} data={data} title={'Class/Event'} />
    </div>
  )
}

export default App