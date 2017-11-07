import { connect } from 'react-redux'
import { fetchToken,
         loginFormOpen, loginFormClose, loginFormChange,
         sideBarOpen, sideBarClose } from '../actions'
import Layout from '../components/Layout.js'

const mapStateToProps = state => {
  return {authenticatedUserId: state.app.auth.user,
          title: state.app.title,
          loginForm: {open: state.app.loginForm.open,
                      user: state.app.loginForm.user,
                      password: state.app.loginForm.password,
                      error: state.app.loginForm.error},
          sideBar: {open: state.app.sideBar.open},
      };
}

const mapDispatchToProps = dispatch => {
    return {
        action: {
            loginForm: {onOpen: () => {dispatch(loginFormOpen())},
                        onClose: () => {dispatch(loginFormClose())},
                        onChange: (user, password) => {dispatch(loginFormChange(user, password))},
                        onSubmit: (user, password) => {dispatch(fetchToken(user, password))}
            },
            sideBar: {onOpen: () => {dispatch(sideBarOpen())},
                      onClose: () => {dispatch(sideBarClose())}
            },
        }
    };
}

const App = connect(mapStateToProps, mapDispatchToProps)(Layout);

export default App;