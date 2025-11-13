function addSubject() {
    const subject = prompt("Please enter the subject name:");
    if (subject) {
        const dropdown = document.getElementById("subjectDropdown");
        const option = document.createElement("option");
        option.text = subject;
        dropdown.add(option);
    }
}
