InternHub is a responsive internship listing website built using HTML, CSS, and JavaScript as part of the EdVyro Full Stack Development Internship.

The website helps users discover internship opportunities, search by keywords, filter by domain and work mode, and view internship details.
**Live Website:**  
https://yuva-015.github.io/InternHub-Internship-Board/
**GitHub Repository:**  
https://github.com/yuva-015/InternHub-Internship-Board
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
- Git and GitHub
- GitHub Pages for deployment
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
│       ├── desktop-homepage.png
│       └── mobile-homepage.png
└── README.md
1. Download or clone the repository.
2. Open the project folder in VS Code.
3. Open the terminal.
4. Run:

```bash
python -m http.server 5500
```

5. Open http://127.0.0.1:5500/ in your browser.
The following manual tests were completed:

- Keyword search
- Domain filtering
- Work mode filtering
- Clear filters
- Internship details popup
- Keyboard navigation
- Empty results state
- Error and retry functionality
- Mobile responsiveness at 360px
- Tablet responsiveness at 768px
- Desktop responsiveness at 1280px
- Live website functionality

## Dataset

Internship records are loaded from the EdVyro sample JSON dataset.
**Source:**  
https://edvyro.in/datasets/source-materials/internship-records-sample.json
![Desktop Screenshot](assets/screenshots/desktop-homepage.png)
![Mobile Screenshot](assets/screenshots/mobile-homepage.png)
The website is deployed using GitHub Pages.
**Live URL:**  
https://yuva-015.github.io/InternHub-Internship-Board/

Task 1 frontend implementation, manual testing, and live deployment completed.
- REST API integration
- Persistent database storage
- Internship application form
- Backend validation and security
- Automated testing
- Production-ready improvements
  