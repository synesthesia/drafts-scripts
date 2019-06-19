// adapted from https://forums.getdrafts.com/t/script-step-post-to-github-without-working-copy/3594
// post to notes on Hugo blog

const credential = Credential.create("GitHub blog repo", "The repo name, and its credentials, hosting the Hugo blog source");

credential.addTextField("username", "GitHub Username");
credential.addTextField('repo', 'Repo name');
credential.addPasswordField("key", "GitHub personal access token");
credential.addTextField('author', 'Author');
credential.authorize();

const githubKey = credential.getValue('key');
const githubUser = credential.getValue('username');
const repo = credential.getValue('repo');
const author = credential.getValue('author');

const http = HTTP.create(); // create HTTP object
const base = 'https://api.github.com';

// const txt = draft.content;
const posttime = new Date();
const title = draft.title;  
const txt = draft.content.replace(/^(`${title}`)/,"");
const tags = draft.tags;
const slugbase = title.toLowerCase().replace(/\s/g, "-");


const datestr = `${posttime.getFullYear()}-${pad(posttime.getMonth() + 1)}-${pad(posttime.getDate())}`;
const timestr = `${pad(posttime.getHours())}:${pad(posttime.getMinutes())}:00`;
const slug = `${datestr}-${slugbase}`


const pdOffset = posttime.getTimezoneOffset();
const offsetChar = pdOffset >= 0 ? '-' : '+';
var pdHours = Math.floor(pdOffset/60);
console.log(pdHours);
pdHours = pdHours >= 0 ? pdHours : pdHours * -1;
console.log(pdHours);
const tzString = `${offsetChar}${pad(pdHours)}:00`;
const postdate = `${datestr}T${timestr}${tzString}`;

const fn = `${slug}.md`;
const link = null;

//const link = getLink();

const yaml = {
    type: 'note',
    slug: `"${slug}"`,
    featured: false,
    draft: false,
    title: `"${title}"`,
    subtitle: "",
    summary: "",
    authors: `["${author}"]`,
    categories: `["quick notes"]`,
    tags: `${JSON.stringify(tags)}`,
    date: postdate // e.g. 2019-06-17T11:58:58+01:00
};

if (link) {
    yaml.linkURL = link;
}

let preamble = "---\n";

for (const f in yaml) {
    preamble += `${f}: ${yaml[f]}\n`;
}

preamble += "---\n\n";

const doc = `${preamble}${txt}`;

const options = {
    url: `https://api.github.com/repos/${githubUser}/${repo}/contents/content/note/${fn}`,
    method: 'PUT',
    data: {
        message: `micropost ${datestr}`,
        content: Base64.encode(doc)
    },
    headers: {
        'Authorization': `token ${githubKey}`
    }
};

var response = http.request(options);

if (response.success) {
    // yay
} else {
    console.log(response.statusCode);
    console.log(response.error);
}

function pad(n) {
    let str = String(n);
    while (str.length < 2) {
        str = `0${str}`;
    }
    return str;
}


function getLink() {
    var p = Prompt.create();

    p.title = 'External link';
    p.message = 'If this is a link post, we need a link.';

    p.addTextField('externalLink', 'Link', '');

    p.addButton('Use');
    p.addButton('Nope');

    const didSelect = p.show();

    const link = p.fieldValues.externalLink;

    if (link && p.buttonPressed == 'Use') {
        return link;
    }

    return null;
}