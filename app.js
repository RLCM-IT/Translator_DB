let allData = []
let editingId = []
let isAdmin = false

const AVAILABLE_LANGUAGES = [
    "deutsch",
    "englisch",
    "spanisch",
    "französisch",
    "italienisch"
]

const supabaseUrl = 'https://bkvvyissajffmhcdduof.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrdnZ5aXNzYWpmZm1oY2RkdW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5ODQ3NTcsImV4cCI6MjA5MzU2MDc1N30.RMNTBpK7npel8Tgr7eHY7zufjn7QDKaQIISyEBCO71c'

const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const loginDiv = document.getElementById('loginDiv')
const appDiv = document.getElementById('appDiv')
const addFormDiv = document.getElementById("addForm")

const emailInput = document.getElementById('email')
const passwordInput = document.getElementById('password')

const loginBtn = document.getElementById('loginBtn')
const logoutBtn = document.getElementById('logoutBtn')
const addBtn = document.getElementById('addBtn')

const searchInput = document.getElementById('search')
const list = document.getElementById('dataList')



loginBtn.addEventListener('click', async () => {
    const email = emailInput.value
    const password = passwordInput.value

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    })

    if (error) {
        console.error("Login error:", error)
        alert(error.message)
        return
    }
    await updateUI()
})



logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut()
    await updateUI()
    })



    async function loadData() {
    const { data, error } = await supabaseClient
        .from('translatorList')
        .select('*')

    if (error) {
        console.error("Data error:", error)
        return
    }

    allData = data
    renderList(allData)
}


addBtn.addEventListener('click', async () => {
    addFormDiv.style.display="block"
})

async function addRow() {
    const name = document.getElementById("add-name").value
    const lastname = document.getElementById("add-lastname").value
    const mail = document.getElementById("add-mail").value

    const container = document.getElementById("add-languages")

    const languages = Array.from(
        container.querySelectorAll("input[type='checkbox']:checked")
    ).map(cb => cb.value.toLowerCase())

    if( !name || !lastname || !mail){
        alert("Please fill all fields")
        return
    }

    const { error } = await supabaseClient
        .from("translatorList")
        .insert([{ name, lastname, mail, languages }])

    if (error) {
        alert(error.message)
        return
    }
    
    document.getElementById("add-name").value = ""
    document.getElementById("add-lastname").value = ""
    document.getElementById("add-mail").value = ""

    container.querySelectorAll("input").forEach(cb => cb.checked = false)

    await loadData()

    
    addFormDiv.style.display = "none"
}


async function renderList(data) {
    list.innerHTML = ''

    data.forEach((item) => {
        const li = document.createElement('li')

        if (editingId === item.id) {
            renderEditRow(li, item)
        } else {
            renderViewRow(li, item)
        }

        /*li.dataset.id = item.id

        li.innerHTML = `
            <div class="view-mode">
                <span>  
                    ${item.name} 
                    ${item.lastname} - 
                    ${item.mail} - 
                    ${formatLanguages(item.languages)}
                </span>
            </div>
            <div class="edit-mode" style="display:none;"></div>

            <div class="actions"></div>
        `

        const text = document.createElement('span')
        text.textContent = `${item.name} 
                            ${item.lastname} - 
                            ${item.mail} - 
                            ${formatLanguages(item.languages)} `

        const editBtn = document.createElement('button')
        editBtn.textContent = "Edit"
        editBtn.addEventListener("click", () => {
            editRow(item.id)
        })

        const delBtn = document.createElement('button')
        delBtn.textContent = "Delete"
        delBtn.addEventListener("click", () => {
            deleteRow(item.id)
        })


        
        li.appendChild(text)
        if (isAdmin) {
            li.appendChild(editBtn)
            li.appendChild(delBtn)
        }*/

        list.appendChild(li)

        //setupRow(li, item)
    })
}


function renderAddLanguages () {
    const container = document.getElementById("add-languages")

    if (!container) return

    container.innerHTML = AVAILABLE_LANGUAGES.map(lang => `
        <label class="lang-item">
            <input type="checkbox" value="${lang}">
            ${lang.charAt(0).toUpperCase() + lang.slice(1)}
        </label>`
    ).join("")
}


function renderViewRow(li, item) {
    const info = document.createElement("div")

    const languages = item.languages
        ? item.languages.map(l =>
            l.charAt(0).toUpperCase() + l.slice(1)
        ).join(", "):""

    info.innerHTML = `
        <b>${item.name} ${item.lastname}</b><br>
        ${item.mail}<br>
        <i>${languages}</li>`

    li.appendChild(info)

    if (isAdmin) {
        const actions = document.createElement("div")
        
        const editBtn = document.createElement('button')
        editBtn.textContent = "Edit"
        
        editBtn.addEventListener("click", () => {
            editingId = item.id
            renderList(allData)
            //enterEditMode(li, item)
        })

        const delBtn = document.createElement('button')
        delBtn.textContent = "Delete"

        delBtn.addEventListener("click", () => {
            deleteRow(item.id)
        })
    
        actions.appendChild(editBtn)
        actions.appendChild(delBtn)

        li.appendChild(actions)
    }
}

/*function setupRow(li, item) {
    const view = li.querySelector(".view-mode")
    const edit = li.querySelector(".edit-mode")
    const actions = li.querySelector(".actions")

    if(isAdmin) {
        const editBtn = document.createElement('button')
        editBtn.textContent = "Edit"
        
        editBtn.addEventListener("click", () => {
            enterEditMode(li, item)
        })

        const delBtn = document.createElement('button')
        delBtn.textContent = "Delete"

        delBtn.addEventListener("click", () => {
            deleteRow(item.id)
        })
    
        actions.appendChild(editBtn)
        actions.appendChild(delBtn)
    }
}
*/
function renderEditRow(li, item) {
    const form = document.createElement("div")

    const selectedLangs = Array.isArray(item.languages) ? item.languages : []

    const languageOptions = AVAILABLE_LANGUAGES.map(lang => {
        const checked = selectedLangs.includes(lang.toLowerCase()) ? "checked" : ""
        return `<label class="lang-item"><input type="checkbox" value="${lang}" ${checked}>
            ${lang.charAt(0).toUpperCase() + lang.slice(1)}
        </option></label>`
    }).join("")

    form.innerHTML = `
        <input id="name-${item.id}" value="${item.name}">
        <input id="lastname-${item.id}" value="${item.lastname}">
        <input id="mail-${item.id}" value="${item.mail}">

        <div id="language-${item.id}" class="lang-container">${languageOptions}</div>
    `
    li.appendChild(form)

    const actions = document.createElement("div")

    const saveBtn = document.createElement("button")
    saveBtn.textContent = "Save"

    saveBtn.addEventListener("click", () => saveEdit(item.id))

    const cancelBtn = document.createElement("button")
    cancelBtn.textContent = "Cancel"

    cancelBtn.addEventListener("click", () => {
        editingId = null
        renderList(allData)
    })
    
    actions.appendChild(saveBtn)
    actions.appendChild(cancelBtn)

    li.appendChild(actions)

    setTimeout(() => {
        document.getElementById(`name-${item.id}`)?.focus()
    }, 0)

    attachKeyboardHandlers(item)
}
/*function enterEditMode(li, item) {
    const view = li.querySelector(".view-mode")
    const edit = li.querySelector(".edit-mode")
    const actions = li.querySelector(".actions")

    view.style.display = "none"
    edit.style.display = "block"
    actions.innerHTML = ""
    
    edit.innerHTML = `
        <input id="name-${item.id}" value="${item.name}">
        <input id="lastname-${item.id}" value="${item.lastname}">
        <input id="mail-${item.id}" value="${item.mail}">

        <input id="language-${item.id}" value="${item.languages}"
                value="${item.languages ? item.languages.join(", "): ""}
                placeholder="Languages (comma seperated)">
    `

    const saveBtn = document.createElement("button")
    saveBtn.textContent = "Save"

    saveBtn.addEventListener("click", () => saveEdit(item.id))

    const cancelBtn = document.createElement("button")
    cancelBtn.textContent = "Cancel"

    cancelBtn.addEventListener("click", () => renderList(allData))
    
    actions.appendChild(saveBtn)
    actions.appendChild(cancelBtn)
}*/



async function saveEdit(id) {
    const name = document.getElementById(`name-${id}`).value
    const lastname = document.getElementById(`lastname-${id}`).value
    const mail = document.getElementById(`mail-${id}`).value.toLowerCase()

    const languageInput = document.getElementById(`language-${id}`)

    const languages = Array.from(languageInput.querySelectorAll("input[type='checkbox']:checked"))
        .map(opt => opt.value.toLowerCase())

    /*const languages = languageInput
        ? languageInput.split(',').map(l =>
            l.trim().toLowerCase()
        )
    :[]*/

    if (!name || !lastname || !mail || !languages) {
        alert("All fields are required")
        return 
    }

    if (!mail.includes("@")) {
        alert("Invalid email")
        return
    }

    const { error } = await supabaseClient
        .from("translatorList")
        .update({ name, lastname, mail, languages})
        .eq('id', id)

    if (error) {
        alert(error.message)
        return
    }

    editingId = null
    await loadData()
}



/*async function editRow(id) {
    const name = prompt("New name?")
    const lastname = prompt("New lastname?")
    const mail = prompt("New mail?")
    const languageInput = prompt("Languages (comma separated, e.g. deutsch, englisch")

    if(!name || !lastname || !mail) return

    const languages = languageInput
        ? languageInput.split(',').map(l =>
            l.trim().toLowerCase()
        )
    :[]

    const { error } = await supabaseClient
        .from("translatorList")
        .update({ name, lastname, mail, languages})
        .eq('id', id)

    if (error) {
        alert(error.message)
        return
    }

    await loadData()
}*/


async function deleteRow(id) {
    if(!confirm("Delet entry?")) return

    const { error } = await supabaseClient
        .from("translatorList")
        .delete()
        .eq('id', id)

    if (error) {
        alert(error.message)
        return
    }

    await loadData()
}




searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase()

    const filtered = allData.filter(item => {
        return (
        item.name?.toLowerCase().includes(query) ||
        item.lastname?.toLowerCase().includes(query) ||
        item.mail?.toLowerCase().includes(query) ||
        item.languages?.join(', ').toLowerCase().includes(query)
        )
    })

    renderList(filtered)
})



async function updateUI(){
    const { data: { session } } = await supabaseClient.auth.getSession()

    isAdmin = true

    if(session) {
        //isAdmin = session.user.user_metadata?.role === "admin"

        loginDiv.style.display = "none"
        appDiv.style.display = "block"
        addFormDiv.style.display = "none"

        updateAdminUI()
        await loadData()
        renderAddLanguages()
    } else {
        loginDiv.style.display = "block"
        appDiv.style.display = "none"
        ddFormDiv.style.display = "none"
        list.innerHTML = ""
        allData = []
    }    
}


function attachKeyboardHandlers(item) {
    const inputs = [
        `name-${item.id}`,
        `lastname-${item.id}`,
        `mail-${item.id}`,
        `language-${item.id}`
    ]

    inputs.forEach(id => {
        const el = document.getElementById(id)

        el?.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                saveEdit(item.id)
            }

            if (e.key === "Escape") {
                editingId = null
                renderList(allData)
            }
        })
    })
}



function updateAdminUI() {
    addBtn.style.display = isAdmin ? 'block' : 'none'
}



const formatLanguages = (arr) =>
    arr?.map(l =>
        l.charAt(0).toUpperCase() + l.slice(1).toLowerCase()
    ).join(', ')



supabaseClient.auth.onAuthStateChange(() => {
updateUI()
})

updateUI()