import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { t } from "i18next";
import { Controller, useForm } from "react-hook-form";
import {
	Button,
	Col,
	Form,
	FormFeedback,
	Input,
	Label,
	ModalBody,
	ModalFooter,
	Row,
} from "reactstrap";

function CreateWeekModal({toggle}) {

	const onlineWeekAPI = useApi().online_week;

	const {
		control,
		setError,
		formState: { errors },
		handleSubmit,
		getValues,
		setValue,
		reset,
		} = useForm({
    		defaultValues: {
      			total_score: 100,
    			},
			});

  	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

  	const calculateFutureDate = (weeks) => {
  	  	const date = new Date();
  	  	date.setDate(date.getDate() + weeks * 7);
  	  	return date.toISOString().split(".")[0];
  	};

	async function onSubmit(cdata) {
		console.log(cdata)
	  	try {
	  	  	await postFetch(onlineWeekAPI.post(cdata));
	  	    reset();
	  	    toggle();
	  	} catch (err) {
	  	  console.error("Unexpected error:", err);
	  	}
	}

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
    	<ModalBody className="row margin_fix">
    		<Row className="col-xs-6">
          		<Col md={6}>
            		<Label for="week_number">7 хоногийн дугаар</Label>
            		<Controller
              			name="week_number"
              			control={control}
              			rules={{ required: "хоногийн дугаар шаардлагатай" }}
						  render={({ field }) => (
        		    		<Input {...field} type="number" />
        		    	)}
            		/>
            		{errors.week_number && (
              			<FormFeedback className="d-block">
                			{t(errors.week_number.message)}
              			</FormFeedback>
            		)}
          		</Col>
        		<Col md={6}>
        		  	<Label for="before_week">Хамаарах өмнөх хичээл</Label>
        		  	<Controller
        		    	name="before_week"
        		    	control={control}
        		    	rules={{
        		    		required: "Хамаарах өмнөх хичээл шаардлагатай",
        		    		validate: value => value !== '' || "Хамаарах өмнөх хичээл шаардлагатай"
        		    	 }}
        		    	render={({ field }) => (
        		    		<Input {...field} type="number" />
        		    	)}
        		   	/>
        		   	{errors.before_week && (
        		   	  <FormFeedback className="d-block">
        		   	    {t(errors.before_week.message)}
        		   	  </FormFeedback>
        			)}
				</Col>
	    		<Col md={6}>
	    		    <Label for="showed_type">Хичээл үзсэнээр тооцох төрөл</Label>
	    		    <Controller
	    		    	name="showed_type"
	    		    	control={control}
	    		    	rules={{ required: "Лекцийн тоо шаардлагатай" }}
	    		    	render={({ field }) => <Input {...field} type="number" />}
	    		    />
	    		    {errors.showed_type && (
	    		    	<FormFeedback className="d-block">
	    		    		{t(errors.showed_type.message)}
	    		    	</FormFeedback>
	    		    )}
	    		</Col>
	    		<Col md={6}>
	    		    <Label for="start_date">Тухайн хичээлийн эхлэх хугацаа</Label>
	    		    <Controller
	    		    	name="start_date"
	    		    	control={control}
	    		    	rules={{ required: "Эхлэх хугацаа шаардлагатай" }}
	    		    	render={({ field }) => (
	    		    		<Input {...field} type="datetime-local" defaultValue={calculateFutureDate(0)}/>
	    		        )}
	    		    />
	    		    {errors.start_date && (
	    		    	<FormFeedback className="d-block">
	    		     		{t(errors.start_date.message)}
	    		    	</FormFeedback>
	    		    )}
	    		</Col>
        		<Col md={6}>
            		<Label for="end_date">Тухайн хичээлийн дуусах хугацаа</Label>
            		<Controller
            			name="end_date"
            			control={control}
            			rules={{ required: "Дуусах хугацаа шаардлагатай" }}
            			render={({ field }) => (
            				<Input
            			    	{...field}
            			    	type="datetime-local"
            			    	defaultValue={calculateFutureDate(16)}
            			  	/>
            			)}
            		/>
            		{errors.end_date && (
            		  	<FormFeedback className="d-block">
            		   		{t(errors.end_date.message)}
            		  	</FormFeedback>
            		)}
                </Col>
          		<Col md={6}>
          			<Label for="work_type">Даалгаврын тооцох төрөл</Label>
          		  		<Controller
          		    		name="work_type"
          		    		control={control}
          		    		rules={{ required: "Семинар лабораторын тоо шаардлагатай" }}
          		    		render={({ field }) => <Input {...field} type="number" />}
          		  		/>
          		  		{errors.work_type && (
          		  		  	<FormFeedback className="d-block">
          		  		  		{t(errors.work_type.message)}
          		  		  	</FormFeedback>
          		  		)}
          		</Col>
        		<Col md={6}>
        			<Label for="challenge_check_score">Шалгалтаар тооцох оноо</Label>
        			<Controller
        			  	name="challenge_check_score"
        			  	control={control}
        			  	rules={{ required: "Шалгалтаар тооцох оноо шаардлагатай" }}
        			  	render={({ field }) => <Input {...field} type="number" />}
        			/>
        			{errors.challenge_check_score && (
        			  	<FormFeedback className="d-block">
        			  	  	{t(errors.challenge_check_score.message)}
        			  	</FormFeedback>
        			)}
        		</Col>
          		<Col check>
          			<Controller
          				name="is_lock"
          				control={control}
          				render={({ field }) => <Input {...field} type="checkbox" />}
          		  	/>{" "}
          		  	<Label check>Өмнөх 7 хоногийн хичээлээс хамаарах</Label>
          		  	{errors.is_lock && (
          		    	<FormFeedback className="d-block">
          		      		{t(errors.is_lock.message)}
          		    	</FormFeedback>
          		  	)}
          		</Col>
        		</Row>
        		<div className="col-xs-6">
        			<Col md={6}>
        		    	<Label for="homework">Гэрийн даалгавар</Label>
        		    	<Controller
        		      		name="homework"
        		      		control={control}
        		      		rules={{ required: "Гэрийн даалгавар" }}
        		      		render={({ field }) => (
        		      			<Input {...field} type="select">
        		      		    	<option value="">Сонгох...</option>
        		      		    	<option value={1}>1</option>
        		      		    	<option value={2}>2</option>
        		      		  	</Input>
        		      		)}
        		    	/>
        		    	{errors.homework && (
        		    	  <FormFeedback className="d-block">
        		    	    {t(errors.homework.message)}
        		    	  </FormFeedback>
        		    	)}
        		  	</Col>
        		  	<Col md={6}>
        		    	<Label for="challenge">7 хоногийн шалгалт</Label>
        		    	<Controller
        		    	  	name="challenge"
        		    	  	control={control}
        		    	  	rules={{ required: "7 хоногийн шалгалт шаардлагатай" }}
        		    	  	render={({ field }) => (
        		    	  	  	<Input {...field} multiple type="select">
        		    	  	  	  	<option value={1891}>this must be exam name and takes id</option>
        		    	  	  	  	<option value={1891}>2</option>
        		    	  	  	  	<option value={1891}>3</option>
        		    	  	  	  	<option value={1891}>4</option>
        		    	  	  	  	<option value={1891}>5</option>
        		    	  	  	</Input>
        		    	  	)}
        		    	/>
        		    	{errors.challenge && (
        		    	  	<FormFeedback className="d-block">
        		    	  	  	{t(errors.challenge.message)}
        		    	  	</FormFeedback>
        		    	)}
        		  	</Col>
					  <Col md={6}>
        		    	<Label for="materials">7 хоногийн шалгалт</Label>
        		    	<Controller
        		    	  	name="materials"
        		    	  	control={control}
        		    	  	rules={{ required: "Тухайн 7 хоногийн материалууд" }}
        		    	  	render={({ field }) => (
        		    	  	  	<Input {...field} multiple type="select">
        		    	  	  	  	<option value={1891}>this must be exam name and takes id</option>
        		    	  	  	  	<option value={1891}>2</option>
        		    	  	  	  	<option value={1891}>3</option>
        		    	  	  	  	<option value={1891}>4</option>
        		    	  	  	  	<option value={1891}>5</option>
        		    	  	  	</Input>
        		    	  	)}
        		    	/>
        		    	{errors.materials && (
        		    	  	<FormFeedback className="d-block">
        		    	  	  	{t(errors.materials.message)}
        		    	  	</FormFeedback>
        		    	)}
        		  	</Col>
        		</div>
      	</ModalBody>
        <ModalFooter>
        	<Button type="submit" color="primary">
          		Хадгалах
        	</Button>
        </ModalFooter>
    </Form>
  );
}

export default CreateWeekModal;