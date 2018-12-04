import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import {SortableContainer, SortableElement, arrayMove} from 'react-sortable-hoc';
import { Link } from 'react-router-dom';

import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import EditIcon from '@material-ui/icons/Edit';
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
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
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
import MoreVertIcon from '@material-ui/icons/MoreVert';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import Menu from '@material-ui/core/Menu';

import CourseLiteratureItem from './CourseLiteratureItem';
import CourseLiteratureAddForm from './forms/CourseLiteratureAddForm';
import CourseGroupListing from './CourseGroupListing';
import CourseAddForm from './forms/CourseAddForm';

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
	   courseOptionsAnchorEl: null,
	   importCourseDialogOpen: false,
	   editCourseDialogOpen: false,
	   filterSelection: null,
	   loading: false,
	   needsUpdate: false,
	   needsUpdateAndReload: false,
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
    const token = sdk.decodeToken();
    this.isStudent = token.principals.indexOf('group:student') === -1 ? false: true;
    this.lti_return_url = token.return_url;
    this.lti_course_url = token.lti_url;
    this.loadCourse()
  }

  componentDidUpdate = (prevProps, prevState) => {

    // let parent iframe know precise height
    let clientHeight = window.document.body.clientHeight;
    if (this.props.openAddDialog && clientHeight < 800){
      clientHeight = 800;
    }
    window.parent.postMessage(
      JSON.stringify({'subject': 'lti.frameResize',
		      'height': clientHeight}), '*');

    if (this.state.needsUpdate || this.state.needsUpdateAndReload){
      this.saveCourse(this.state.needsUpdateAndReload);
      this.setState({needsUpdate: false,
		     needsUpdateAndReload: false});
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
    sdk.courseLoad(this.props.id, !this.isStudent).then(
      response => response.json(),
      error => {console.log('LoadCourse Error: ' + error)})
      .then(data => {
	let module = 'all'
	if(this.props.filter){
	  // filter by module id from url
	  console.log('filter', this.props.filter);
	  const toc = data.course.toc;
	  const module_id = parseInt(this.props.filter, 10);
	  for (var i=0;i<toc.length;i++){
	    if (module_id === toc[i].id){
	      module = toc[i].module;

	    }
	  }
	}
	this.tocItems = data.toc_items;
	this.setState({course: data.course,
		       module: module,
		       loading: false});
      });
  }

  importCourse = (courseId) => {
    this.setState({loading: true});
    sdk.courseLoad(courseId, !this.isStudent).then(
      response => response.json(),
      error => {console.log('importCourse Error: ' + error)})
      .then(data => {
	const course = this.state.course;
	const newToc = [];
	data.course.toc.forEach((toc) => {
	  delete toc.id;
	  newToc.push(toc)
	});
	course.toc = course.toc.concat(newToc);
	this.setState({course,
		       needsUpdateAndReload: true,
		       loading: false});
      });
  }


  saveCourse = (reload=false) => {
    this.setState({loading: true});
    sdk.courseUpdate(this.props.id, {course: this.state.course}).then(
      response => response.json(),
      error => {console.log('SaveCourse Error: ' + error)})
      .then(data => {
	this.tocItems = data.toc_items;
	if(reload === true){
	  this.loadCourse()
	}else{
	  this.setState({course: data.course,
			 draggableTocItem: null,
			 loading: false});
	}
      });
  }

  handleModuleChange = (e) => {
    const value = e.target.value;
    if (value === 'new'){
      this.setState({newModuleDialogOpen: true,
		     newModuleName: '',
		     selectedModuleName: null});
    } else {
      this.setState({module: value});
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

  handleLTIFormSubmit = (value) => (e) => {
    this.setState({filterSelection: value});
    // submit the form, redirecting back to the LMS
    const contentItems = JSON.stringify({
        "@context": "http://purl.imsglobal.org/ctx/lti/v1/ContentItem",
        "@graph": [
          {
            "@type": "LtiLinkItem",
            "@id": `${this.lti_course_url}${value||''}`,
            "url": `${this.lti_course_url}${value||''}`,
            "title": "Course Literature",
            "text": "Course Literature",
            "mediaType": "application/vnd.ims.lti.v1.ltilink",
            "placementAdvice": {
	      "displayWidth": "100%",
	      "displayHeight": "300px",
              "presentationDocumentTarget": "iframe"
            }
          }
        ]
      })
    this.filterFormInputRef.value = contentItems;
    this.filterFormRef.submit();
  }

  handleCourseEdit = (e) => {
    this.setState({editCourseDialogOpen: true,
		   courseOptionsAnchorEl:null})
  }

  handleRemove = (id) => {
    const newToc = [];
    this.state.course.toc.forEach((item) => {
      if(item.id !== id){
	newToc.push(item);
      }
    });
    this.setState({
      needsUpdate: true,
      course: {...this.state.course,
	       toc: newToc}
   });
  }

  handleCourseImport = (e) => {
    this.setState({importCourseDialogOpen: true,
		   courseOptionsAnchorEl:null})
  }

  openCourseOptionsMenu = (e) => {
    this.setState({courseOptionsAnchorEl: e.currentTarget})
  }

  closeCourseOptionsMenu = () => {
    this.setState({courseOptionsAnchorEl:null});
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
			tocId={item.id}
			id={item.target_id}
			isStudent={this.isStudent}
			courseId={this.props.id}
			comment={item.comment}
			module={item.module}
			draggable={this.state.draggableTocItem === item.target_id}
			onStartDrag={this.handleLiteratureDrag}
			onEditModuleName={this.handleEditModuleName}
			onEditComment={this.handleEditComment}
			onRemove={this.handleRemove}
			tocItem={this.tocItems[item.target_id]||{}} />
	))}
      </List>
    );
  });

  renderEditCourseDialog = () => {
    return (
      <CourseAddForm open={true}
		     course={this.state.course}
		     onClose={this.handleCancelCourseEdit}
		     onSubmit={this.handleEditCourseSubmit} />)
  }
  renderImportCourseDialog = () => {
    if (this.props.navigation.length === 0){
      this.props.loadNavigation()
    }
    return (
      <Dialog open={true} onClose={this.handleCancelCourseImport}>
	  <CourseGroupListing
	    id={this.props.groupId}
	    navigation={this.props.navigation}
	    widget={true}
	    onSelect={this.handleSubmitCourseImport} />
        <DialogActions>
	  <Button onClick={this.handleCancelCourseImport} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    )
  }

  handleEditCourseSubmit = (courseData) => {
    const course = this.state.course;
    course.title = courseData.title;
    course.start_date =  courseData.start_date;
    course.end_date = courseData.end_date;

    this.setState({course,
		   editCourseDialogOpen: false,
		   needsUpdateAndReload: true});
  }
  handleCancelCourseEdit = () => {
    this.setState({editCourseDialogOpen: false});
  }

  handleCancelCourseImport = () => {
    this.setState({importCourseDialogOpen: false});
  }
  handleSubmitCourseImport = (targetCourseId) => {
    this.setState({importCourseDialogOpen: false});
    this.importCourse(targetCourseId);
  }

  renderNewModuleDialog = () => {
    return (
      <Dialog open={true} onClose={() => {this.setState({newModuleDialogOpen: false})}}>
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
	    value={this.state.newModuleName}
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
    )
  }



  render(){
    const { query, loading, course, module,
	    newModuleDialogOpen,
	    commentDialogOpen, commentText,
	    importCourseDialogOpen,
	    editCourseDialogOpen,
	    filterSelection, courseOptionsAnchorEl} = this.state;
    const { classes, openAddDialog, id, groupId,
	    showFilterSelect } = this.props;
    const SortableList = this.renderSortableList;
    if (course === null) {
      return <LinearProgress />;
    }
    if (showFilterSelect){
      return (
	<Paper>
	  <form action={this.lti_return_url} method="POST" ref={form => this.filterFormRef=form}>
	    <input type="hidden" name="lti_message_type" value="ContentItemSelection" />
	    <input type="hidden" name="lti_version" value="LTI-1p0" />
	    <input type="hidden" name="content_items" ref={form => this.filterFormInputRef=form}/>
          <AppBar position="sticky" color="default">
          <Toolbar>
            <Typography variant="title" color="inherit" noWrap>
	      Select course literature
	    </Typography>
	  </Toolbar>
       </AppBar>
	<List>
	  <ListItem button
		    selected={true}
		    value="all"
		    onClick={this.handleLTIFormSubmit('')}>
	    <ListItemIcon><AddIcon /></ListItemIcon>
	    <ListItemText inset primary="All course literature"/>
	  </ListItem>
	  <Divider/>
	  {course.toc.map(toc => (
	    toc.module ?
	      (<ListItem
		   button key={toc.module}
		   value={toc.id}
		   onClick={this.handleLTIFormSubmit(toc.id)}
		   selected={toc.id === filterSelection}>
	       <ListItemIcon><AddIcon /></ListItemIcon>
		 <ListItemText inset primary={toc.module} />
	       </ListItem>)
	    : null
	  ))}
	</List>
	  </form>
	  <Zoom in={true} className={classes.AddButton}>
	  <Button
	variant="fab"
	value="new"
	onClick={this.handleModuleChange}
	color="primary">
          <AddIcon />
	  </Button>
	  </Zoom>
	{newModuleDialogOpen ? this.renderNewModuleDialog() : null}
	  </Paper>)
	}
    return (
      <Paper>
	<CourseLiteratureAddForm open={openAddDialog}
				 courseId={id}
				 tocItems={this.tocItems}
				 onClose={this.handleAddLiteratureClose}
				 onSubmit={this.handleAddLiteratureSubmit} />
	{importCourseDialogOpen ? this.renderImportCourseDialog() : null}
	{editCourseDialogOpen ? this.renderEditCourseDialog() : null}
	{newModuleDialogOpen ? this.renderNewModuleDialog() : null}
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
      {this.props.filter ? null :
        <AppBar position="sticky" color="default">
       <Toolbar style={this.isStudent ? {} : {paddingRight:0,paddingLeft:16}}>
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
	    <FormControl className={classes.formControlSelect}>
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
       {this.isStudent ? null : (
       <IconButton aria-label="Options"
                   aria-owns={Boolean(courseOptionsAnchorEl) ? 'courseOptionsMenu' : null}
                   onClick={this.openCourseOptionsMenu}
                   aria-haspopup="true"><MoreVertIcon /></IconButton>
       )}
       <Menu id="courseOptionsMenu"
             anchorEl={courseOptionsAnchorEl}
             onClose={this.closeCourseOptionsMenu}
             open={Boolean(courseOptionsAnchorEl)} >
            <MenuItem onClick={this.handleCourseEdit}>
                <ListItemIcon><EditIcon /></ListItemIcon> Edit Course Info
       </MenuItem>
       <MenuItem onClick={this.handleCourseImport}>
         <ListItemIcon><ImportExportIcon /></ListItemIcon> Import Course Materials
       </MenuItem>
       <MenuItem onClick={() => {this.handleModuleChange({target:{value: 'new'}})}}><ListItemIcon><AddIcon /></ListItemIcon> New Module</MenuItem>
       </Menu>
       </Toolbar>
       </AppBar>
      }
	{loading ? <LinearProgress /> : null }
	<SortableList lockAxis="y"
      helperClass={classes.DragHelper}
      useDragHandle={true}
      onSortEnd={this.handleSortEnd}
      items={this.filteredToc === null ? (course||{}).toc||[] : this.filteredToc} />
	<Dialog open={Boolean(((course||{}).toc||[]).length === 0)}>
	<DialogTitle>Your course is empty..</DialogTitle>
	<DialogContent>Start adding learning materials.</DialogContent>
	 <DialogActions>
	<Button variant="contained"
                color="primary"
                to={`/group/${groupId}/course/${id}/add`}
                component={Link}>Add Material</Button>
	<Button variant="contained"
                color="primary"
                onClick={this.handleCourseImport}
	>Import from Course</Button>
	</DialogActions>
	</Dialog>

      {this.isStudent ? null :
	<Zoom in={true} className={classes.AddButton}>
	 <Button variant="fab"
		  to={`/group/${groupId}/course/${id}/add`}
		  component={Link}
		  type="submit"
		  color="primary">
        <AddIcon />
	 </Button>
	 </Zoom>}
      </Paper>);
    }
}

export default CourseListing;
