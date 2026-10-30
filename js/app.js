/**
 *   Copyright 2020-2026 wixette@gmail.com
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 * @fileoverview The whole app, put together: the panel namespace with all
 * of its parts. js/main.js starts it in the page; the tests import it
 * to have everything the page has.
 */

import {panel} from './panel.js';
import './panel-debug.js';
import './panel-dock.js';
import './panel-front.js';
import './panel-link.js';
import './panel-load.js';
import './panel-tty.js';
import './panel-tutorial.js';
import './panel-view.js';

export {panel};
