UpdateDocuments = React.createClass({
  getDefaultProps() {
    return {
      editorId: 'edit'
    }
  },

  render() {
    const value = EJSON.stringify({$set: {}}, {indent: '\t'});

    return <div>
      <ReactAce
        value={value}
        mode="json"
        theme="chrome"
        name={this.props.editorId}
        width="100%"
        onLoad={this.handleLoad}
        editorProps={{$blockScrolling: true}}
      />
      <div className="m-t clearfix">
        <button className="btn btn-primary pull-right" onClick={this.handleSubmit}>Update all documents</button>
      </div>
    </div>
  },

  handleLoad(editor) {
    editor.getSession().setUseWrapMode(true);
    editor.gotoLine(1, 1);
    editor.focus();
  },

  handleSubmit(event) {
    event.preventDefault();

    var data = ace.edit(this.props.editorId).getValue();
    data = processJson(data);

    if (data === false) {
      sAlert.error('Error parsing JSON!');
      return false;
    }
  
    try {
      data = EJSON.parse(data);
    } catch (error) {
      sAlert.error('Invalid JSON format!');
      return false;
    }
    const documentData = this.props.document.value;

    Meteor.call('updateDocuments', this.props.collection._id, this.props.filter, data, (error, result) => {
      sAlert.success('Documents updated: ' + result);
      this.props.onSave();
    });
  }
});


UpdateDocuments.Modal = React.createClass({

  getInitialState() {
    return { showModal: false };
  },

  render() {

    const icon = this.props.icon ? <i className={this.props.icon} /> : null;

    const updateProps = this.props.updateProps;
    const onSave = updateProps.onSave;
    updateProps.onSave = () => {
      this.handleClose();
      if(updateProps.onSave) {
        log('> updateProps.onSave');
        setTimeout(() => { onSave(); }, 100);
      }
    };

    return <span>
      <a className={this.props.className} href="#" onClick={this.handleOpen} title="Update filtered documents">{icon}{this.props.text}</a>

      <Modal show={this.state.showModal} onHide={this.handleClose} bsSize="lg">
        <Modal.Header closeButton>
          <Modal.Title>Update filtered documents</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="alert alert-warning" role="alert">Updates all documents matching the filter. This could be more than you currently see, due to pagination.</div>
          <div className="alert alert-info" role="alert"><b>Filter:</b> {updateProps.filter}</div>
          <UpdateDocuments {...updateProps} />
        </Modal.Body>
      </Modal>
    </span>
  },

  handleClose() {
    this.setState({ showModal: false });
  },

  handleOpen() {
    this.setState({ showModal: true });
  }
});
