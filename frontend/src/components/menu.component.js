import React, { Component } from "react";

export default class Menu extends Component {
  render() {
    return (
      <div className="App">
        <nav id="sidebar">
          <div className="sidebar-header">
            <h3>Menu</h3>
          </div>

          <ul className="list-unstyled components">
            <p>Dummy heading</p>
            <li className="active">
              <a
                href="#newSubmenu"
                data-toggle="collapse"
                aria-expanded="false"
                className="dropdown-toggle"
              >
                New
              </a>
              <ul id="newSubmenu" className="collapse list-unstyled">
                <li>
                  <a href="#">A</a>
                </li>
                <li>
                  <a href="#">CNAME</a>
                </li>
              </ul>
            </li>
            <li>
              <a href="#settingsMenu">Settings</a>
            </li>
          </ul>
        </nav>
      </div>
    );
  }
}
