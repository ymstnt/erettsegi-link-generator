let generatedLink;
let dateTime = new Date();
const finalExamForm = document.getElementById("final-exam-form");

// Dynamically fill year selector with years
function fillFormWithYears() {
  let currentYear = dateTime.getUTCFullYear();
  if (!checkAvailableMonths().spring) {
    currentYear = currentYear - 1;
  }

  let yearSelector = finalExamForm.querySelector("#year");
  for (let i = currentYear; i >= 2005; i--) {
    yearSelector.add(new Option(i.toString(), i.toString()));
  }
}

fillFormWithYears();
scrollOutputToEnd();
formUpdate();

// Update the output url and link
function formUpdate(pressedButtonId) {
  let { year, period, subject, difficulty } = getFormValues();

  if (period == undefined || difficulty == undefined) {
    selectRadiosIfNoneIsSelected(period, difficulty);
    formUpdate();
  }

  updateFileInputs(subject);
  ({ period, subject } = handleSpecialCases(year, period, subject));
  const fixedSubject = fixSubjectByYear(subject, year);

  const { fileType, itFileType } = getFileTypes(pressedButtonId, year);

  console.log(
    `Form updated: Year: ${year}\nPeriod: ${period}\nSubject: ${subject}\nSubject (fixed): ${fixedSubject}\nDifficulty: ${difficulty}\nFile type: ${fileType}\nIT subject file type: ${itFileType}`
  );
  generatedLink = generateLink(
    year,
    period,
    fixedSubject,
    difficulty,
    fileType,
    itFileType
  );
  document.querySelector("#output").value = generatedLink;
}

// Gets the currently selected values from form inputs
function getFormValues() {
  const year = finalExamForm.querySelector("#year").value;
  const period = finalExamForm.querySelector(
    'input[name="period"]:checked'
  )?.value;
  const difficulty = finalExamForm.querySelector(
    'input[name="difficulty"]:checked'
  )?.value;
  const subject = finalExamForm.querySelector("#subject").value;

  return { year, period, difficulty, subject };
}

// Enables source files and solution files buttons when IT subjects are selected, disables them otherwise
function updateFileInputs(subject) {
  const enable = ["inf", "infoism", "digkult"].includes(subject);
  document.querySelector("#sourcefiles").disabled = !enable;
  document.querySelector("#solutionfiles").disabled = !enable;
}

function handleSpecialCases(year, period, subject) {
  const y = parseInt(year);

  // Disable october (fall) if the current year has not passed it, set "new" period
  if (y === dateTime.getUTCFullYear() && !checkAvailableMonths().fall) {
    toggleRadioEnabled("#october", false);
    if (period === "october") {
      document.querySelector("#may").checked = true;
      document.querySelector("#october").checked = false;
      period = "may";
    }
  } else {
    // Enable october (fall) if the current year has passed it
    toggleRadioEnabled("#october", true);
  }

  // Hide specific subjects depending on the year
  toggleElementVisibility("#infoism", y < 2017); // Ágazati informatika didn't exist before 2017
  if (y < 2017) {
    subject = switchSubjectWhenDisabled("infoism", "inf", subject);
  }
  toggleElementVisibility("#digkult", y < 2022); // Digitális kultúra didn't exist before 2022, after 2023 közismereti informatika was removed
  if (y < 2022) {
    subject = switchSubjectWhenDisabled("digkult", "inf", subject);
  }
  toggleElementVisibility("#inf", y > 2023); // After 2023, közismereti informatika no longer exists
  if (y > 2023) {
    subject = switchSubjectWhenDisabled("inf", "digkult", subject);
  }

  return { period, subject }; // return the "new" period -> this only changes if the current year has not passed october (fall) yet
}

// IT subjects were called differently in specific years, handle that here
function fixSubjectByYear(subject, year) {
  const y = parseInt(year);
  if (y < 2017 && subject === "infoism") return "inf";
  if (y < 2022 && subject === "digkult") return "inf";
  if (y > 2023 && subject === "inf") return "digkult";
  if (subject === "inf" && y <= 2011 && !(y === 2011 && period === "oktober"))
    return "info";
  return subject;
}

// Get the file type depending on which button was cliked on
function getFileTypes(pressedButtonId, year) {
  const y = parseInt(year);
  let fileType, itFileType;

  switch (pressedButtonId) {
    case "task":
      fileType = "fl.pdf";
      itFileType = "";
      break;
    case "sourcefiles":
      itFileType = y >= 2005 && y <= 2008 ? "forras" : "for";
      fileType = "fl.zip";
      break;
    case "solution":
      fileType = "ut.pdf";
      itFileType = "";
      break;
    case "solutionfiles":
      itFileType = y >= 2005 && y <= 2008 ? "megoldas" : "meg";
      fileType = "ut.zip";
      break;
    default:
      fileType = "fl.pdf";
      itFileType = "";
  }

  return { fileType, itFileType };
}

// Finally, after getting all data, generate the new download link
function generateLink(year, period, subject, difficulty, fileType, itFileType) {
  let prefix = "https://www.oktatas.hu/bin/content/dload/erettsegi/feladatok"; // Prefix is always the same
  const y = parseInt(year);
  if (y > 2012) prefix += "_"; // ... except before 2012 for some reason

  // Convert form values to link parts
  const generatedPeriod = period === "may" ? "tavasz" : "osz";
  const month = period === "may" ? "maj" : "okt";
  const level = difficulty === "middle" ? "kozep" : "emelt";
  const last2 = year.slice(-2);

  // Generate the final part of the link consisting of the year, period, difficulty level, difficulty level's first char, subject, (IT subject file type) and file type
  let part;
  if (y === 2005 && period === "may") {
    // Format for 2005 may (spring)
    part = `${year}${generatedPeriod}/${level}/${level[0]}_${subject}${itFileType}_${fileType}`;
  } else if (
    // Format between 2005 october (fall) and 2012 may (spring)
    y >= 2005 &&
    y <= 2012 &&
    !(y === 2005 && period === "may") &&
    !(y === 2012 && period === "october")
  ) {
    part = `${year}${generatedPeriod}/${level}/${level[0]}_${subject}${itFileType}_${last2}${month}_${fileType}`;
  } else {
    // Format now
    part = `${year}${generatedPeriod}_${level}/${level[0]}_${subject}${itFileType}_${last2}${month}_${fileType}`;
  }

  return prefix + part;
}

// Put event listener to all selects and radio buttons -> trigger formUpdate
const inputElements = Array.from(
  finalExamForm.getElementsByClassName("input-element")
);
inputElements.forEach((element) => {
  element.addEventListener("change", formUpdate);
});

// Put event listener on all buttons -> trigger formUpdate and pass button id
const buttons = Array.from(finalExamForm.getElementsByClassName("btn"));
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let element = e.target;
    formUpdate(element.id);
    window.open(generatedLink, "_blank");
  });
});

// Element hiding toggle
function toggleElementVisibility(element, hide) {
  let el = document.querySelector(element);
  if (hide) {
    el.style.display = "none";
  } else {
    el.style.display = "";
  }
}

// Radio button disable toggle
function toggleRadioEnabled(element, enable) {
  let el = document.querySelector(element);
  if (enable) {
    el.disabled = false;
  } else {
    el.disabled = true;
  }
}

// Switch from selected subject if disabled
function switchSubjectWhenDisabled(subjectToCheck, subjectToSwitchTo, subject) {
  if (subject === subjectToCheck) {
    document.querySelector("#subject").value = subjectToSwitchTo;
    subject = subjectToSwitchTo;
  }
  return subject;
}

// Check if the current year has passed may (spring) and october (fall)
function checkAvailableMonths() {
  let currentMonth = dateTime.getUTCMonth();

  let spring = currentMonth > 5;
  let fall = currentMonth > 10;

  return { spring, fall };
}

function scrollOutputToEnd() {
  const output = document.querySelector("#output");
  output.scrollLeft = output.scrollWidth;
}

function selectRadiosIfNoneIsSelected(period, difficulty) {
  if (period == undefined) {
    document.querySelector("#may").checked = true;
  }

  if (difficulty == undefined) {
    document.querySelector("#middle").checked = true;
  }
}
