import { Link } from "react-router-dom"
import { FaSun, FaMoon } from 'react-icons/fa'

const Header = ({ darkMode, toggleTheme }) => {
    return (
        <nav className="navbar navbar-expand-lg bg-primary-subtle">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">DashBoard</a>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon" />
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link to={'/home'} className="nav-link active" aria-current="page" href="#">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/categorias'} className="nav-link" href="#">Categorias</Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/productos'} className="nav-link" href="#">Productos</Link>
                        </li>
                         <li className="nav-item">
                            <Link to={'/usuarios'} className="nav-link" href="#">Usuarios</Link>
                        </li>

                    </ul>
                    <div>
                        <button onClick={toggleTheme} className="btn btn-dark btn-sm ">
                            {darkMode ? <FaSun /> : <FaMoon />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>

    )
}

export default Header