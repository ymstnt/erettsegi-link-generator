let generatedLink;
let pressedButton;
let dateTime = new Date();
const finalExamForm = document.getElementById("final-exam-form");

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
formUpdate();

function formUpdate() {
  console.log("Form updated");

  let year = finalExamForm.querySelector("#year").value;
  let period = finalExamForm.querySelector(
    'input[name="period"]:checked'
  )?.value;
  let difficulty = finalExamForm.querySelector(
    'input[name="difficulty"]:checked'
  )?.value;
  let subject = finalExamForm.querySelector("#subject").value;

  let generatedPeriod;
  let periodMonth;
  let generatedDifficulty;
  let generatedSubject;
  let generatedFileType;
  let itFileType;

  if (period === "may") {
    generatedPeriod = "tavasz";
    periodMonth = "maj";
  } else {
    generatedPeriod = "osz";
    periodMonth = "okt";
  }

  if (subject === "inf" || subject === "infoism" || subject === "digkult") {
    document.querySelector("#sourcefiles").disabled = false;
    document.querySelector("#solutionfiles").disabled = false;
  } else {
    document.querySelector("#sourcefiles").disabled = true;
    document.querySelector("#solutionfiles").disabled = true;
  }

  let convertedYear = parseInt(year);

  if (
    convertedYear === dateTime.getUTCFullYear() &&
    !checkAvailableMonths().fall
  ) {
    toggleElementVisibility("#october", true);
    if (period === "october") {
      document.querySelector("#period").value = "may";
      period = "may";
      generatedPeriod = "tavasz";
    }
  } else {
    toggleElementVisibility("#october", false);
  }

  if (convertedYear < 2017) {
    toggleElementVisibility("#infoism", true);
    ({ subject, generatedSubject } = switchSubjectWhenDisabled(
      "infoism",
      "inf",
      subject,
      generatedSubject
    ));
  } else {
    toggleElementVisibility("#infoism", false);
  }

  if (convertedYear < 2022) {
    toggleElementVisibility("#digkult", true);
    ({ subject, generatedSubject } = switchSubjectWhenDisabled(
      "digkult",
      "inf",
      subject,
      generatedSubject
    ));
  } else {
    toggleElementVisibility("#digkult", false);
  }

  if (convertedYear > 2023) {
    toggleElementVisibility("#inf", true);
    ({ subject, generatedSubject } = switchSubjectWhenDisabled(
      "inf",
      "digkult",
      subject,
      generatedSubject
    ));
  } else {
    toggleElementVisibility("#inf", false);
  }

  if (
    subject === "inf" &&
    convertedYear <= 2011 &&
    !(convertedYear === 2011 && period === "oktober")
  ) {
    generatedSubject = "info";
  } else {
    generatedSubject = subject;
  }

  let linkPrefix =
    "https://www.oktatas.hu/bin/content/dload/erettsegi/feladatok";

  switch (pressedButton) {
    case "task":
      generatedFileType = "fl.pdf";
      itFileType = "";
      break;
    case "sourcefiles":
      itFileType =
        convertedYear >= 2005 && convertedYear <= 2008 ? "forras" : "for";
      generatedFileType = "fl.zip";
      break;
    case "solution":
      generatedFileType = "ut.pdf";
      itFileType = "";
      break;
    case "solutionfiles":
      itFileType =
        convertedYear >= 2005 && convertedYear <= 2008 ? "megoldas" : "meg";
      generatedFileType = "ut.zip";
      break;
    default:
      generatedFileType = "fl.pdf";
      itFileType = "";
      break;
  }

  if (convertedYear > 2012) {
    linkPrefix += "_";
  }

  if (difficulty === "middle") {
    generatedDifficulty = "kozep";
  } else if (difficulty === "advanced") {
    generatedDifficulty = "emelt";
  }

  let assembledPart;

  if (convertedYear === 2005 && period === "may") {
    assembledPart = `${year}${generatedPeriod}/${generatedDifficulty}/${generatedDifficulty.charAt(
      0
    )}_${generatedSubject}${itFileType}_${generatedFileType}`;
  } else if (
    convertedYear >= 2005 &&
    convertedYear <= 2012 &&
    !(convertedYear === 2005 && period === "may") &&
    !(convertedYear === 2012 && period === "october")
  ) {
    assembledPart = `${year}${generatedPeriod}/${generatedDifficulty}/${generatedDifficulty.charAt(
      0
    )}_${generatedSubject}${itFileType}_${year.slice(
      -2
    )}${periodMonth}_${generatedFileType}`;
  } else {
    assembledPart = `${year}${generatedPeriod}_${generatedDifficulty}/${generatedDifficulty.charAt(
      0
    )}_${generatedSubject}${itFileType}_${year.slice(
      -2
    )}${periodMonth}_${generatedFileType}`;
  }

  generatedLink = linkPrefix + assembledPart;
  document.querySelector("#output").value = generatedLink;
}

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

function updateFileInputs(subject) {
  const enable = ["inf", "infoism", "digkult"].includes(subject);
  document.querySelector("#sourcefiles").disabled = !enable;
  document.querySelector("#solutionfiles").disabled = !enable;
}

function handleSpecialCases(year, period) {
  const y = parseInt(year);

  if (y === dateTime.getUTCFullYear() && !checkAvailableMonths().fall) {
    toggleElementVisibility("#october", true);
    if (period === "october") {
      document.querySelector("#period").value = "may";
    }
  } else {
    toggleElementVisibility("#october", false);
  }

  toggleElementVisibility("#infoism", y < 2017);
  toggleElementVisibility("#digkult", y < 2022);
  toggleElementVisibility("#inf", y > 2023);
}

function fixSubjectByYear(subject, year) {
  const y = parseInt(year);
  if (y < 2017 && subject === "infoism") return "inf";
  if (y < 2022 && subject === "digkult") return "inf";
  if (y > 2023 && subject === "inf") return "digkult";
  if (subject === "inf" && y <= 2011 && !(y === 2011 && period === "oktober"))
    return "info";
  return subject;
}

function getFileTypes(year, period) {
  const y = parseInt(year);
  let fileType, itFileType;

  switch (pressedButton) {
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

function generateLink(year, period, subject, difficulty, fileType, itFileType) {
  let prefix = "https://www.oktatas.hu/bin/content/dload/erettsegi/feladatok";
  const y = parseInt(year);
  if (y > 2012) prefix += "_";

  const generatedPeriod = period === "may" ? "tavasz" : "osz";
  const month = period === "may" ? "maj" : "okt";
  const level = difficulty === "middle" ? "kozep" : "emelt";
  const last2 = year.slice(-2);

  let part;
  if (y === 2005 && period === "may") {
    part = `${year}${generatedPeriod}/${level}/${level[0]}_${subject}${itFileType}_${fileType}`;
  } else if (
    y >= 2005 &&
    y <= 2012 &&
    !(y === 2005 && period === "may") &&
    !(y === 2012 && period === "october")
  ) {
    part = `${year}${generatedPeriod}/${level}/${level[0]}_${subject}${itFileType}_${last2}${month}_${fileType}`;
  } else {
    part = `${year}${generatedPeriod}_${level}/${level[0]}_${subject}${itFileType}_${last2}${month}_${fileType}`;
  }

  return prefix + part;
}

const inputElements = Array.from(
  finalExamForm.getElementsByClassName("input-element")
);
inputElements.forEach((element) => {
  element.addEventListener("change", formUpdate);
});

const buttons = Array.from(finalExamForm.getElementsByClassName("btn"));
buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let element = e.target;
    pressedButton = element.id;
    formUpdate();
    window.open(generatedLink, "_blank");
  });
});

function toggleElementVisibility(element, hide) {
  let el = document.querySelector(element);
  if (hide) {
    el.classList.add("hidden");
  } else {
    el.classList.remove("hidden");
  }
}

function switchSubjectWhenDisabled(
  subjectToCheck,
  subjectToSwitchTo,
  subject,
  generatedSubject
) {
  if (subject === subjectToCheck) {
    document.querySelector("#subject").value = subjectToSwitchTo;
    subject = subjectToSwitchTo;
    generatedSubject = subjectToSwitchTo;
  }
  return { subject, generatedSubject };
}

function checkAvailableMonths() {
  let currentMonth = dateTime.getUTCMonth();

  let spring = currentMonth > 5;
  let fall = currentMonth > 10;

  return { spring, fall };
}
