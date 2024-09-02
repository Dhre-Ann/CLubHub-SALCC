/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./public/js/script.js":
/*!*****************************!*\
  !*** ./public/js/script.js ***!
  \*****************************/
/***/ (() => {

eval("document.addEventListener(\"DOMContentLoaded\", () => {\r\n    \r\n    // Filter by club name\r\n    const clubNameInput = document.getElementById('search-club-name');\r\n    const clubs = document.querySelectorAll('[data-tags]');\r\n\r\n    clubNameInput.addEventListener('input', () => {\r\n        const filter = clubNameInput.value.toLowerCase();\r\n        clubs.forEach(club => {\r\n            const clubName = club.querySelector('h3').textContent.toLowerCase();\r\n            console.log(\"clubname: \", clubName);\r\n            if (clubName.includes(filter)) {\r\n                club.style.display = '';\r\n            } else {\r\n                club.style.display = 'none';\r\n            }\r\n        });\r\n    });\r\n\r\n    \r\n    // const clubNameInput = document.getElementById('search-club-name');\r\n    // const clubs = document.querySelectorAll('#club-container');\r\n\r\n    // // Search and filter by typing club name\r\n    // if (clubNameInput){\r\n    //     clubNameInput.addEventListener('input', () => {\r\n    //         const filter = clubNameInput.value.toLowerCase(); // This monitors key strokes as you type\r\n    //         clubs.forEach(club => {\r\n    //             let clubName = club.querySelector('h3');\r\n    //             clubName = clubName.textContent.toLowerCase();\r\n    //             // if the clubs name includes characters user types in...\r\n    //             if (clubName.includes(filter)) {\r\n    //                 console.log(\"clubName: \",clubName);\r\n    //                 console.log(\"filter: \", filter);\r\n    //                 club.style.display = '';\r\n    //             } else {\r\n    //                 club.style.display = 'none';\r\n    //             }\r\n    //         });\r\n    //     });\r\n    // }\r\n    \r\n\r\n    // Filter by tags\r\n    const tagInput = document.getElementById('tag-search');\r\n    const tagsContainer = document.getElementById('tag-dropdown');\r\n\r\n    // Get unique tags from clubs\r\n    const tags = new Set();\r\n    clubs.forEach(club => {\r\n        const clubTags = club.getAttribute('data-tags').split(' ');\r\n        clubTags.forEach(tag => tags.add(tag));\r\n    });\r\n\r\n    // Create tag elements\r\n    tags.forEach(tag => {\r\n        const tagElement = document.createElement('div');\r\n        tagElement.classList.add('p-1', 'text-gray-700', 'font-medium', 'cursor-pointer', 'hover:bg-gray-200', 'rounded');\r\n        tagElement.textContent = tag;\r\n        tagElement.addEventListener('click', () => {\r\n            filterClubsByTag(tag.toLowerCase());\r\n        });\r\n        tagsContainer.appendChild(tagElement);\r\n    });\r\n\r\n    // Show tags container on input focus\r\n    tagInput.addEventListener('focus', () => {\r\n        tagsContainer.classList.remove('hidden');\r\n    });\r\n\r\n    function filterClubsByTag(selectedTag) {\r\n        clubs.forEach(club => {\r\n            const clubTags = club.getAttribute('data-tags').toLowerCase().split(' ');\r\n            if (clubTags.includes(selectedTag)) {\r\n                club.style.display = '';\r\n            } else {\r\n                club.style.display = 'none';\r\n            }\r\n        });\r\n    }\r\n\r\n    // Hide tag dropdown when clicking outside\r\n    document.addEventListener('click', (e) => {\r\n        if (!tagInput.contains(e.target) && !tagsContainer.contains(e.target)) {\r\n            tagsContainer.classList.add('hidden');\r\n        }\r\n    });\r\n});\r\n\n\n//# sourceURL=webpack://clubhub-salcc/./public/js/script.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./public/js/script.js"]();
/******/ 	
/******/ })()
;