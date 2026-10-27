InternHub is a responsive internship listing website built using HTML, CSS, and JavaScript.
- Search internships by keyword
- Filter internships by domain
- Filter internships by work mode
- Clear all filters
- View internship details in a popup
- Loading, empty, and error states
- Retry loading internship data
- Keyboard-accessible interactions
- Responsive layout for mobile, tablet, and desktop
- HTML5
- CSS3
- JavaScript (Vanilla JS)
- JSON for internship data
```text
Internship-Board/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── data/
│   └── internships.json
├── assets/
│   └── screenshots/
└── README.md
```
1. Download or clone the repository.
2. Open the project folder in VS Code.
3. Open the terminal.
4. Run:
```bash
python -m http.server 5500
```
5. Open http://127.0.0.1:5500/ in your browser.
Manually tested:
- Search and filters
- Clear filters
- Internship details popup
- Keyboard navigation
- Empty state
- Error and retry functionality
- Responsive layouts at 360px, 768px, and 1280px
Internship records are loaded from the EdVyro sample JSON dataset.
Source:
https://edvyro.in/datasets/source-materials/internship-records-sample.json
Task 1 frontend implementation and manual functional testing completed.
- REST API integration
- Persistent database storage
- Internship application form
- Backend validation and security
- Production deployment
  