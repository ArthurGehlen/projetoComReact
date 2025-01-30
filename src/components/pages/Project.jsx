import styles from "./Project.module.css"

import { parse, v4 as uuidv4 } from 'uuid'
import { useParams } from "react-router-dom"
import { useState, useEffect } from 'react'

import Loading from "../layout/Loading"
import Container from "../layout/Container"
import ProjectForm from "../project/ProjectForm"
import ServiceForm from "../service/ServiceForm"
import Message from "../layout/Message"
import ServiceCard from '../service/ServiceCard'

function Project() {
    const { id } = useParams()

    const [project, setProject] = useState([])
    const [services, setServices] = useState([])
    const [showProjectForm, setShowProjectForm] = useState(false)
    const [showServiceForm, setShowSeriveForm] = useState(false)
    const [message, setMessage] = useState()
    const [type, setType] = useState()

    useEffect(() => {
        setTimeout(() => {
            fetch(`http://localhost:5000/projects/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((resp) => resp.json())
                .then((data) => {
                    setProject(data)
                    setServices(data.services)
                })
                .catch((err) => console.log(err));
        }, 750);
    }, [id])

    function edit_post(project) {
        setMessage('')

        if (project.budget < project.cost) {
            setMessage('O orçamento não pode ser menor que o custo do projeto!')
            setType('error')
            return false;
        }

        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(project),
        })
            .then((resp) => resp.json()
                .then((data) => {
                    setProject(data)
                    setShowProjectForm(false)
                    setMessage('Projeto atualizado!')
                    setType('success')
                    return false;
                })
                .catch((err) => console.log(err))
            )
    }

    function create_service(project) {
        setMessage('')
        // last service
        const last_service = project.services[project.services.length - 1]

        last_service.id = uuidv4()

        const last_service_cost = last_service.cost;
        const new_cost = parseFloat(project.cost) + parseFloat(last_service_cost)

        // maximum value validation
        if (new_cost > parseFloat(project.budget)) {
            setMessage('Orçamento ultrapassado, verifique o valor do serviço')
            setType('error')
            project.services.pop()
            return false
        }

        // add service cost to project total cost
        project.cost = new_cost

        // update project
        fetch(`http://localhost:5000/projects/${project.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project)
        })
            .then((resp) => resp.json())
            .then((data) => {
                setShowSeriveForm(false)
            })
            .catch((err) => console.log(err));
    }

    function remove_service(id, cost) {
        const service_update = project.services.filter(
            (service) => service.id !== id
        )
        const project_updated = project

        project_updated.services = service_update
        project_updated.cost = parseFloat(project.cost) - parseFloat(cost)

        fetch(`http://localhost:5000/projects/${project_updated.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project_updated)
        })
            .then((resp) => resp.json())
            .then(() => {
                setProject(project_updated)
                setServices(service_update)
                setMessage('Serviço removido com sucesso!')
                setType('success')
            })
            .catch((err) => console.log(err))
    }

    function toggle_project_form() {
        setShowProjectForm(!showProjectForm)
    }

    function toggle_service_form() {
        setShowSeriveForm(!showServiceForm)
    }

    return (
        <>
            {project.name ?
                <div className={styles.project_detail}>
                    <Container customClass="column">
                        {message && <Message type={type} msg={message} />}
                        <div className={styles.details_container}>
                            <h1>Projeto: {project.name}</h1>
                            <button onClick={toggle_project_form} className={styles.btn}>
                                {!showProjectForm ? 'Editar Projeto' : 'Fechar'}
                            </button>
                            {!showProjectForm ?
                                (
                                    <div className={styles.project_info}>
                                        <p>
                                            <span>Categoria:</span> {project.category.name}
                                        </p>
                                        <p>
                                            <span>Total de Orçamento:</span> R${project.budget}
                                        </p>
                                        <p>
                                            <span>Total Utilizado:</span> R${project.cost}
                                        </p>
                                    </div>
                                ) :
                                (
                                    <div className={styles.project_info}>
                                        <ProjectForm
                                            handleSubmit={edit_post}
                                            btnText="Concluir edição"
                                            projectData={project} />
                                    </div>
                                )}
                        </div>
                        <div className={styles.service_form_container}>
                            <h2>Adicione um serviço:</h2>
                            <button onClick={toggle_service_form} className={styles.btn}>
                                {!showServiceForm ? 'Adicionar serviço' : 'Fechar'}
                            </button>
                            <div className={styles.project_info}>
                                {showServiceForm && (
                                    <ServiceForm
                                        handle_submit={create_service}
                                        btn_text="Adicionar serviço"
                                        project_data={project} />
                                )}
                            </div>
                        </div>
                        <h2>Serviços</h2>
                        <Container customClass="start">
                            {services.length > 0 &&
                                services.map((service) => (
                                    <ServiceCard
                                        id={service.id}
                                        name={service.name}
                                        cost={service.cost}
                                        description={service.description}
                                        key={service.id}
                                        handle_remove={remove_service}
                                    />
                                ))
                            }
                            {services.length === 0 && <p>Não há serviços cadastrados.</p>}
                        </Container>
                    </Container>
                </div>
                :
                (<Loading />)}
        </>
    )
}

export default Project 