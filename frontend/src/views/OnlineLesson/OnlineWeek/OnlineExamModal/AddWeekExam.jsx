import AuthContext from "@src/utility/context/AuthContext";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import useToast from "@src/utility/hooks/useToast";
import { useContext } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Button,
	Col,
	Form,
	Input,
	Label,
	ModalBody,
	ModalFooter,
	Row
} from "reactstrap";
import CreateTest from "@src/views/TestV1/create_test";

function AddWeekMaterial({toggle, item}) {
	const addToast = useToast()
	const { user } = useContext(AuthContext)
	const homeworkAPI = useApi().homework;
	const {
		control,
		formState: { errors },
		handleSubmit,
		reset,
            } = useForm({
                defaultValues: {
					created_user : user.id,
                    },
                });


  	const { fetchData: postFetch } = useLoader({});

	async function onSubmit(cdata) {
	  	try {
	  	  	await postFetch(homeworkAPI.post(cdata, item.id));
				addToast(
					{
						type: 'success',
						text: 'Амжилттай хадгалаллаа'
					}
				)
	  	    reset();
	  	    toggle();
	  	} catch (err) {
	  	  console.error("Unexpected error:", err);
	  	}
	}


  return (
    <Form onSubmit={handleSubmit(onSubmit)} >
    	<ModalBody className="row margin_fix">
    		<Row className="col-xs-6 d-flex flex-column">
                <Col md={12}>
					<CreateTest week_id={item.id}/>
          		</Col>
        		</Row>
      	</ModalBody>
        <ModalFooter>
        	<Button type="submit" color="primary">
          		Хадгалах
        	</Button>
        </ModalFooter>
    </Form>
  );
}

export default AddWeekMaterial;