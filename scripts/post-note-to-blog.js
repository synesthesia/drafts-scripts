// adapted from https://forums.getdrafts.com/t/script-step-post-to-github-without-working-copy/3594


const credential = Credential.create("GitHub blog repo", "The repo name, and its credentials, hosting the Jekyll blog.");

credential.addTextField("username", "GitHub Username");
credential.addTextField('repo', 'Repo name');
credential.addPasswordField("key", "GitHub personal access token");

credential.authorize();

const githubKey = credential.getValue('key');
const githubUser = credential.getValue('username');
const repo = credential.getValue('repo');

const http = HTTP.create(); // create HTTP object
const base = 'https://api.github.com';

const txt = draft.content;
const posttime = new Date();

const datestr = `${posttime.getFullYear()}-${pad(posttime.getMonth() + 1)}-${pad(posttime.getDate())}`;
const timestr = `${pad(posttime.getHours())}:${pad(posttime.getMinutes())}`;
const slug = String((posttime.getHours() * 60 * 60) + (posttime.getMinutes() * 60) + posttime.getSeconds());

const fn = `${datestr}-${slug}.markdown`;

const link = getLink();

const yaml = {
    layout: 'post',
    date: `${datestr} ${timestr}`,
    category: 'micropost',
    title: '""'
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
    url: `https://api.github.com/repos/${githubUser}/${repo}/contents/_posts/${fn}`,
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