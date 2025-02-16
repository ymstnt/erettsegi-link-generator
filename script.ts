let generatedLink: string;
let pressedButton: string;
let dateTime = new Date();

function fillFormWithYears() {
  let currentYear = dateTime.getUTCFullYear();
  if (!checkAvailableMonths().spring) {
    currentYear = currentYear - 1;
  }
  
  let yearSelector = <HTMLSelectElement>document.querySelector("#year");
  for (let i = currentYear; i >= 2005; i--) {
    yearSelector.add(new Option(i.toString(), i.toString()));
  }
}

fillFormWithYears();
formUpdate();

//Érettségi link generator
function formUpdate() {
  console.log("Form updated");

  let year = (<HTMLInputElement>document.querySelector("#year")).value;

  let period = (<HTMLInputElement>document.querySelector("#period")).value;
  let generatedDifficulty = (<HTMLInputElement>document.querySelector("#difficulty"))
    .value;
  let subject = (<HTMLInputElement>document.querySelector("#subject")).value;

  let generatedPeriod: string;
  let periodMonth: string;
  let generatedSubject: string;
  let generatedFileType: string;
  let itFileType: string;

  if (period == "majus") {
    generatedPeriod = "tavasz";
    periodMonth = "maj";
  } else {
    generatedPeriod = "osz";
    periodMonth = "okt";
  }

  // Enable and disable source and solution files if appropriate subjects are selected
  if (subject == "inf" || subject == "infoism" || subject == "digkult") {
    (<HTMLInputElement>document.querySelector("#sourcefiles")).disabled = false;
    (<HTMLInputElement>document.querySelector("#solutionfiles")).disabled =
      false;
  } else {
    (<HTMLInputElement>document.querySelector("#sourcefiles")).disabled = true;
    (<HTMLInputElement>document.querySelector("#solutionfiles")).disabled =
      true;
  }

  let convertedYear: number = parseInt(year);

  //Hide október-november if latest year is selected using .hidden class
  if (convertedYear == dateTime.getUTCFullYear() && !checkAvailableMonths().fall) {
    toggleElementVisibility("#oktober", true);
    //Select május if október-november is selected and 2023
    if (period == "oktober") {
      (<HTMLInputElement>document.querySelector("#period")).value = "majus";
      period = "majus";
      generatedPeriod = "tavasz";
    }
  } else {
    toggleElementVisibility("#oktober", false);
  }
  // Ágazati informatika didn't exist before 2017
  if (convertedYear < 2017) {
    toggleElementVisibility("#infoism", true);
    ({ subject, generatedSubject} = switchSubjectWhenDisabled("infoism", "inf", subject, generatedSubject));
  }
  else {
    toggleElementVisibility("#infoism", false);
  }
  // Digitális kultúra didn't exist before 2022, after 2023 közismereti informatika was removed
  if (convertedYear < 2022) {
    toggleElementVisibility("#digkult", true);
    ({ subject, generatedSubject} = switchSubjectWhenDisabled("digkult", "inf", subject, generatedSubject));
  }
  else {
    toggleElementVisibility("#digkult", false);
  }
  // After 2023, közismereti informatika no longer exists
  if (convertedYear > 2023) {
    toggleElementVisibility("#inf", true);
    ({ subject, generatedSubject} = switchSubjectWhenDisabled("inf", "digkult", subject, generatedSubject));
  }
  else {
    toggleElementVisibility("#inf", false);
  }

  if (subject == "inf" && convertedYear <= 2011 && !(convertedYear == 2011 && period == "oktober")) {
    generatedSubject = "info";
  }
  else {
    generatedSubject = subject;
  }
  
  let linkPrefix: string = "https://www.oktatas.hu/bin/content/dload/erettsegi/feladatok";

  switch (pressedButton) {
    case "task":
      generatedFileType = "fl.pdf";
      itFileType = "";
      break;
    case "sourcefiles":
      if (convertedYear >= 2005 && convertedYear <= 2008) {
        itFileType = "forras";
      } else {
        itFileType = "for";
      }
      generatedFileType = "fl.zip";
      break;
    case "solution":
      generatedFileType = "ut.pdf";
      itFileType = "";
      break;
    case "solutionfiles":
      if (convertedYear >= 2005 && convertedYear <= 2008) {
        itFileType = "megoldas";
      } else {
        itFileType = "meg";
      }
      generatedFileType = "ut.zip";
      break;
    default:
      generatedFileType = "fl.pdf";
      itFileType = "";
      break;
  }

  if (convertedYear > 2012) {
    linkPrefix = linkPrefix + '_';
  }

  let firstCharDifficulty: string = generatedDifficulty.charAt(0);
  let cutYear: string = year.slice(-2);

  let assembledPart: string;

  if (convertedYear == 2005 && period == "majus") {
    assembledPart = `${year}${generatedPeriod}/${generatedDifficulty}/${firstCharDifficulty}_${generatedSubject}${itFileType}_${generatedFileType}`;
  }
  else if (convertedYear >= 2005 && convertedYear <= 2012 && !(convertedYear == 2005 && period == "majus") && !(convertedYear == 2012 && period == "oktober")) {
    assembledPart = `${year}${generatedPeriod}/${generatedDifficulty}/${firstCharDifficulty}_${generatedSubject}${itFileType}_${cutYear}${periodMonth}_${generatedFileType}`;
  }
  else {
    assembledPart = `${year}${generatedPeriod}_${generatedDifficulty}/${firstCharDifficulty}_${generatedSubject}${itFileType}_${cutYear}${periodMonth}_${generatedFileType}`;
  }

  generatedLink = linkPrefix + assembledPart;
  (<HTMLInputElement>document.querySelector("#output")).value = generatedLink;
}

//Form elements event listeners
const dropdowns = Array.from(document.getElementsByClassName("dropdown"));

dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("change", formUpdate);
});

const buttons = Array.from(document.getElementsByClassName("btn"));

buttons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let element = e.target;
    pressedButton = (<HTMLInputElement>element).id;
    formUpdate();
    window.open(generatedLink, "_blank");
  });
});

function toggleElementVisibility(element: string, hide: boolean): void {
  if (hide == true) {
    (<HTMLInputElement>document.querySelector(element)).classList.add("hidden");
  } else {
    (<HTMLInputElement>document.querySelector(element)).classList.remove("hidden");
  }
}

function switchSubjectWhenDisabled(subjectToCheck: string, subjectToSwitchTo: string, subject: string, generatedSubject: string): { subject: string; generatedSubject: string } {
  if (subject == subjectToCheck) {
    (<HTMLInputElement>document.querySelector("#subject")).value = subjectToSwitchTo;
    subject = subjectToSwitchTo;
    generatedSubject = subjectToSwitchTo;
  }
  return { subject, generatedSubject };
}

function checkAvailableMonths(): { spring: boolean, fall: boolean } {
  let currentMonth = dateTime.getUTCMonth();

  let spring = false;
  if (currentMonth > 5) {
    spring = true;
  }

  let fall = false;
  if (currentMonth > 10) {
    fall = true;
  }

  return { spring, fall };
}
