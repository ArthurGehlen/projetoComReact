import { useState } from 'react'

import Input from '../form/Input'
import SubmitButton from '../form/SubmitButton'

import styles from "../project/ProjectForm.module.css"

function ServiceForm({ handle_submit, btn_text, project_data }) {

    const [service, setService] = useState({})

    function submit(e) {
        e.preventDefault()
        project_data.services.push(service)
        handle_submit(project_data)
    }

    function handle_change(e) {
        setService({ ...service, [e.target.name]: e.target.value })
    }

    return (
        <form onSubmit={submit} className={styles.form}>
            <Input
                type="text"
                text="Nome do serviço"
                name="name"
                placeholder="Insira o nome do serviço"
                handleOnChange={handle_change}
            />
            <Input
                type="number"
                text="Custo do serviço"
                name="cost"
                placeholder="Insira o custo do serviço"
                handleOnChange={handle_change}
            />
            <Input
                type="text"
                text="Descrição do serviço"
                name="description"
                placeholder="Descreva o serviço"
                handleOnChange={handle_change}
            />
            <SubmitButton text={btn_text} />
        </form>
    )
}

export default ServiceForm