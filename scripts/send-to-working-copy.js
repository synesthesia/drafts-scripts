
(() => {

	const settings = Credential.create("Working Copy Notes","Repo information and URL key for Working Copy notes");

	settings.addTextField("repo", "Repository");
	settings.addTextField("key","URL key");

	settings.authorize();

	const repoName = settings.getValue("repo");
	const urlAutomationKey = settings.getValue("key") || "";
	
	// Get the filename from the draft
	// This is probably not necessary, as Drafts invisibly removes the heading tag
	let fileName = draft.title.replace(/^#(\w?)/gi, '$1') + ".md";

	// Get all details of the repo files
	let cb = CallbackURL.create();

	cb.baseURL = "working-copy://x-callback-url/status/";
	cb.addParameter("repo", repoName);
	cb.addParameter("path", "/");
	cb.addParameter("unchanged", 1);
	cb.addParameter("key", encodeURIComponent(urlAutomationKey));

	let success = cb.open();

	if (success) {
		let repo = cb.callbackResponse;
		let filePath = "";

		// Look for all instances of this file name
		const files = findObjectsByKey(
				JSON.parse(repo.json), 
				"name",
 				fileName);

		if (files.length == 1 ) {
			filePath = dirName(files[0].path);
		
		} else if(files.length > 1) {
			const pr = Prompt.create();

			pr.title = "Select correct path";
			pr.message = "Multiple files with this filename located.  " + 				"Please choose the correct path as save destination";
		
			const paths = [];
		
			for (let i=0; i < files.length; i++) {
				paths.push(dirName(files[i].path));
			}

			pr.addPicker("chosenPath", "", [paths], null);
			pr.addButton("OK", 1);
		
			let didSelect = pr.show();
		
			if (didSelect) {
				filePath = paths[pr.fieldValues["chosenPath"]];
			}
		}
	
		// Write file to repo
		let wcUrl = "working-copy://x-callback-url/write/" +
			"?key=" + encodeURIComponent(urlAutomationKey) +
			"&repo=" + encodeURIComponent(repoName);
		
		if (files.length == 0) {
			// Nothing was found. 
			// Working Copy should prompt you to Save As
			// path may be empty if the file exists at the root
			wcUrl += "&no_path=empty" +
				"&filename=" + encodeURIComponent(fileName);
		} else {
			wcUrl += "&path=" + encodeURIComponent(filePath + fileName);
		}
	
		wcUrl += "&x-source=Drafts&x-success="+encodeURIComponent("drafts5://");
		wcUrl += "&text=" + encodeURIComponent(draft.content);

		app.openURL(wcUrl, false);	
	}
})();

// Support functions

// Search the entire repo to find the filenames.  Could be multiple.
function findObjectsByKey(array, key, value) {

	var fileList = [];
	for (var i = 0; i < array.length; i++) {
		if (array[i][key] === value) {
			fileList.push(array[i]);
		}
	}
	return fileList;
}

// Get the path without the filename
function dirName(str) {
	var base = new String(str).substring(0, str.lastIndexOf('/') + 1); 
	return base;
}