import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { Link } from 'react-router-dom';

import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import List from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import AddIcon from '@material-ui/icons/Add';
import Zoom from '@material-ui/core/Zoom';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


import CourseLiteratureItem from './CourseLiteratureItem';
import CourseLiteratureAddForm from './forms/CourseLiteratureAddForm';

import IdrisSDK from '../sdk.js';
const sdk = new IdrisSDK();

const styles = theme => ({
  formControl: {
    width: '100%',
  },
  formControlSelect: {
      minWidth: 200,
      maxWidth: 350,
  },
  optionsButton: {
    color:'#bdbdbd'
  },
  searchText: {
    maxWidth: '85%',
    textOverflow: 'ellipsis'
  },
  AddButton: {
    position: 'fixed',
    left: '100%',
    top: '100%',
    marginLeft: -90,
    marginTop: -90
  },
  DragHelper: {
    border: 'dashed 2px #bdbdbd'
  }

});


@withStyles(styles)
class CourseListing extends Component {

  state = {query: '',
	   loading: false,
	   needsUpdate: false,
	   module: 'all',
	   course: null,
	   newModuleDialogOpen: false,
	   newModuleName: '',
	   commentDialogOpen: false,
	   commentText: '',
	   selectedModuleName: null,
	   selectedTocItem: null,
	   draggableTocItem: null};
  filteredToc = null;
  tocItems = {};

  componentDidMount = (props) => {
    this.loadCourse()
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state.needsUpdate){
      this.saveCourse();
      this.setState({needsUpdate: false});
    }
    if (this.state.query !== prevState.query ||
	this.state.module !== prevState.module){
      const query = this.state.query.toLowerCase();
      const module = this.state.module;
      if (query === '' && module === 'all'){
	this.filteredToc = null;
      } else {
	let currentModule = null;
	this.filteredToc = [];
	this.state.course.toc.forEach((toc) => {
	  const tocItem = this.tocItems[toc.target_id] || {};
	  if (toc.module){
	    currentModule = toc.module;
	    if (module !== 'all' && module === toc.module){
	      this.filteredToc.push(toc);
	      return;
	    }
	  }
	  if ((tocItem.title||'').toLowerCase().indexOf(query) !== -1){
	    if (module === 'all' || module === currentModule){
	      this.filteredToc.push(toc);
	    }
	  } else {
	    (tocItem.author||[]).map((author) => {
	      if (author.literal.toLowerCase().indexOf(query) !== -1){
		if (module === 'all' || module === currentModule){
		  this.filteredToc.push(toc);
		}
		return;
	      }
	    })
	  }
	});
      }
      // note, that filtering does not change state or props
      // so we need to force a render
      this.forceUpdate();

    }

  }

  loadCourse = () => {
    this.setState({loading: true});
    sdk.courseLoad(this.props.id).then(
      response => response.json(),
      error => {console.log('RelationField Error: ' + error)})
      .then(data => {
	this.tocItems = data.toc_items;
	this.setState({course: data.course, loading: false});
      });
  }


  saveCourse = () => {
    this.setState({loading: true});
    sdk.courseUpdate(this.props.id, {course: this.state.course}).then(
      response => response.json(),
      error => {console.log('RelationField Error: ' + error)})
      .then(data => {
	this.tocItems = data.toc_items;
	this.setState({course: data.course,
		       draggableTocItem: null,
		       loading: false});
      });
  }

  handleModuleChange = (e) => {
    const value = e.target.value;
    if (value === 'new'){
      this.setState({newModuleDialogOpen: true,
		     newModuleName: '',
		     selectedModuleName: null});
    } else {
      this.setState({module: e.target.value});
    }
  }

  handleQueryChange = (e) => {
    this.setState({query: e.target.value});
  }

  handleSubmitModuleName = () => {
    const toc = this.state.course.toc;

    if (this.state.selectedModuleName !== null){
      // edit module name
      for (let i=0; i < toc.length ; i++){
	if (toc[i].module === this.state.selectedModuleName){
	  toc[i].module = this.state.newModuleName;
	  break;
	}
      }
    } else {
      // add new module name
      toc.push({module: this.state.newModuleName});
    }
    this.setState({newModuleDialogOpen: false,
		   newModuleName: '',
		   needsUpdate: true,
		   selectedModuleName: null,
		   course: {...this.state.course,
			    toc: toc}});
  }

  handleEditModuleName = (module) => {
    this.setState({newModuleDialogOpen: true,
		   selectedModuleName: module,
		   newModuleName: module});
  }

  handleEditComment = (module, id, comment) => {
    this.setState({commentDialogOpen: true,
		   selectedModuleName: module,
		   selectedTocItem: id,
		   commentText: comment || ''});
  }

  handleReorder = (event, previousIndex, nextIndex, fromId, toId) => {
    console.log(event, previousIndex, nextIndex, fromId, toId);
  }

  handleSubmitComment = () => {
    const toc = this.state.course.toc;
    for (let i=0; i < toc.length ; i++){
      if (this.state.selectedModuleName && toc[i].module === this.state.selectedModuleName){
	toc[i].comment = this.state.commentText;
	break;
      }
      if (this.state.selectedTocItem && toc[i].target_id === this.state.selectedTocItem){
	toc[i].comment = this.state.commentText;
	break;
      }
    }
    this.setState({commentDialogOpen: false,
		   commentText: '',
		   selectedModuleName: null,
		   selectedTocItem: null,
		   needsUpdate: true,
		   course: {...this.state.course,
			    toc: toc}});
  }

  handleSortEnd = ({oldIndex, newIndex}) => {
    this.setState({
      needsUpdate: true,
      course: {...this.state.course,
	       toc: arrayMove(this.state.course.toc, oldIndex, newIndex)}
   });
  }

  handleAddLiteratureClose = () => {
    this.loadCourse();
    this.props.history.push(`/group/${this.props.groupId}/course/${this.props.id}`);
  }

  handleLiteratureDrag = (id) => {
    this.setState({draggableTocItem: id});
  }

  renderSortableItem = SortableElement((value) => {
    return (<CourseLiteratureItem {...value} />);
  });

  renderSortableList = SortableContainer(({items}) => {
    const SortableItem = this.renderSortableItem;
    return (
      <List dense>
	{items.map((item, index) => (
	  <SortableItem key={item.id}
			index={index}
			id={item.target_id}
			comment={item.comment}
			module={item.module}
			draggable={this.state.draggableTocItem === item.target_id}
			onStartDrag={this.handleLiteratureDrag}
			onEditModuleName={this.handleEditModuleName}
			onEditComment={this.handleEditComment}
			tocItem={this.tocItems[item.target_id]||{}} />
	))}
      </List>
    );
  });


  render(){
    const { query, loading, course, module,
	    newModuleDialogOpen, newModuleName,
	    commentDialogOpen, commentText} = this.state;
    const { classes, openAddDialog, id, groupId } = this.props;
    const SortableList = this.renderSortableList;
    if (course === null) {
      return <LinearProgress />;
    }
    return (
      <Paper>
	<CourseLiteratureAddForm open={openAddDialog}
				 courseId={id}
				 tocItems={this.tocItems}
				 onClose={this.handleAddLiteratureClose}
				 onSubmit={this.handleAddLiteratureSubmit} />
	{newModuleDialogOpen ? (
          <Dialog open={newModuleDialogOpen} onClose={() => {this.setState({newModuleDialogOpen: false})}}>
            <DialogTitle>
	      {this.state.selectedModuleName === null ? 'New' : 'Edit'} Module
	    </DialogTitle>
          <DialogContent>
            <DialogContentText>
	      Divide your course literature into modules. This makes it easier for students to find the
	      correct literature.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              label="Module Name"
	      onChange={(e) => {this.setState({newModuleName: e.target.value})}}
	      value={newModuleName}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
	    <Button onClick={() => {this.setState({newModuleDialogOpen: false})}} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleSubmitModuleName} color="primary">
              {this.state.selectedModuleName === null ? 'New' : 'Edit'}
            </Button>
          </DialogActions>
        </Dialog>
	): null}
	{commentDialogOpen ? (
          <Dialog open={commentDialogOpen} onClose={() => {this.setState({commentDialogOpen: false})}}>
            <DialogTitle>Comment </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Add your comment"
	      variant="outlined"
	      multiline
	      rows="4"
	      onChange={(e) => {this.setState({commentText: e.target.value})}}
	      value={commentText}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
	    <Button onClick={() => {this.setState({commentDialogOpen: false})}} color="primary">
              Cancel
            </Button>
            <Button onClick={this.handleSubmitComment} color="primary">
	      Update
            </Button>
          </DialogActions>
        </Dialog>
	): null}
        <AppBar position="sticky" color="default">
          <Toolbar>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel htmlFor="search" classes={{root: classes.searchText}}>
                <Typography variant="body1" color="inherit" noWrap>
		  {`${(course||{}).title||''}`}
		</Typography>
	      </InputLabel>
              <Input
                id="search"
                type="text"
                value={query}
                onChange={this.handleQueryChange}
                endAdornment={<InputAdornment position="end"><IconButton><SearchIcon /></IconButton></InputAdornment>}
		/>
            </FormControl>
	    {<FormControl className={classes.formControlSelect}>
              <InputLabel shrink={true} htmlFor="modules">Modules</InputLabel>
              <Select
		value={module||''}
		onChange={this.handleModuleChange}
		inputProps={{
		  name: 'modules',
		  id: 'modules',
		}}
		>
		  <MenuItem value="all" selected={module === 'all'}>All Modules</MenuItem>
	          <Divider/>
	     {course.toc.map(toc => (
	       toc.module ?
	       <MenuItem key={toc.module}
	       value={toc.module}>{toc.module}</MenuItem>
		 : null
	     ))}
	          <Divider/>
		  <MenuItem value="new"><ListItemIcon><AddIcon /></ListItemIcon> New Module</MenuItem>
	     </Select>
        </FormControl>
	     }
	</Toolbar>
	</AppBar>
	{loading ? <LinearProgress /> : null }
	<SortableList lockAxis="y"
      helperClass={classes.DragHelper}
      useDragHandle={true}
      onSortEnd={this.handleSortEnd}
      items={this.filteredToc === null ? (course||{}).toc||[] : this.filteredToc} />
	<Zoom in={true} className={classes.AddButton}>
	  <Button variant="fab"
		  to={`/group/${groupId}/course/${id}/add`}
		  component={Link}
		  type="submit"
		  color="primary">
        <AddIcon />
	</Button>
	</Zoom>
      </Paper>);
    }
}

export default CourseListing;
