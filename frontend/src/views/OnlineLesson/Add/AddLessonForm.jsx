import AuthContext from "@src/utility/context/AuthContext";
import useApi from "@src/utility/hooks/useApi";
import useLoader from "@src/utility/hooks/useLoader";
import { t } from "i18next";
import { useContext } from "react";
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

function AddLessonForm({toggle}) {
  // context
	const { loading, user, setUser, menuVisibility, setMenuVisibility } =
	  useContext(AuthContext);
	// hooks
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
      			total_score: 100
    			},
			});

  	const { isLoading: postLoading, fetchData: postFetch } = useLoader({});

  	// api
  	const OnlineLessonAPI = useApi().online_lesson;

  	const calculateFutureDate = (weeks) => {
  	  	const date = new Date();
  	  	date.setDate(date.getDate() + weeks * 7);
  	  	return date.toISOString().split(".")[0];
  	};

	async function onSubmit(cdata) {
	  	try {
	  		if (typeof cdata.students === "string") {
	  	    	cdata.students = [parseInt(cdata.students)];
	  	    } else if (Array.isArray(cdata.students)) {
	  	    	cdata.students = cdata.students.map((student) => parseInt(student));
	  	  	}

	  	  	cdata.create_type = parseInt(cdata.create_type);
	  	  	cdata.total_score = parseFloat(cdata.total_score);
	  	  	cdata.lekts_count = parseInt(cdata.lekts_count);
	  	  	cdata.seminar_count = parseInt(cdata.seminar_count);
	  	  	cdata.exam_count = parseInt(cdata.exam_count);
	  	  	cdata.lesson = parseInt(cdata.lesson);
	  	  	cdata.created_user = parseInt(cdata.created_user);

	  	  	await postFetch(OnlineLessonAPI.lessonRegister(cdata));

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
            		<Label for="lesson">Хичээл</Label>
            		<Controller
              			name="lesson"
              			control={control}
              			rules={{ required: "Хичээл шаардлагатай" }}
              			render={({ field }) => (
               				<Input {...field} type="select">
               				  <option value="">Сонгох...</option>
               				  <option value={1}>1</option>
               				  <option value={2}>2</option>
               				</Input>
             			)}
            		/>
            		{errors.lesson && (
              			<FormFeedback className="d-block">
                			{t(errors.lesson.message)}
              			</FormFeedback>
            		)}
          		</Col>
          		<Col md={6}>
          			<Label for="create_type">Үүсгэх төрөл</Label>
          		  	<Controller
          		    	name="create_type"
          		    	control={control}
          		    	rules={{ required: "Үүсгэх төрөл шаардлагатай" }}
          		    	render={({ field }) => (
          		    		<Input {...field} type="select">
          		    		  <option value="">Сонгох...</option>
          		    		  <option value={1}>16 долоо хоног</option>
          		    		  <option value={2}>Хугацаа тохируулах</option>
          		    		</Input>
          		    	)}
          			/>
            		{errors.create_type && (
            		  <FormFeedback className="d-block">
            		    {t(errors.create_type.message)}
            		  </FormFeedback>
            		)}
        		</Col>

        		<Col md={6}>
        		  	<Label for="total_score">Нийт үнэлэх оноо</Label>
        		  	<Controller
        		    	name="total_score"
        		    	control={control}
        		    	rules={{
        		    		required: "Нийт үнэлэх оноо шаардлагатай",
        		    		validate: value => value !== '' || "Нийт үнэлэх оноо шаардлагатай"
        		    	 }}
        		    	render={({ field }) => (
        		    		<Input {...field} type="number" />
        		    	)}
        		   	/>
        		   	{errors.total_score && (
        		   	  <FormFeedback className="d-block">
        		   	    {t(errors.total_score.message)}
        		   	  </FormFeedback>
        			)}
				</Col>
	    		<Col md={6}>
	    		    <Label for="lekts_count">Лекцийн тоо</Label>
	    		    <Controller
	    		    	name="lekts_count"
	    		    	control={control}
	    		    	rules={{ required: "Лекцийн тоо шаардлагатай" }}
	    		    	render={({ field }) => <Input {...field} type="number" />}
	    		    />
	    		    {errors.lekts_count && (
	    		    	<FormFeedback className="d-block">
	    		    		{t(errors.lekts_count.message)}
	    		    	</FormFeedback>
	    		    )}
	    		</Col>
	    		<Col md={6}>
	    		    <Label for="start_date">Эхлэх хугацаа</Label>
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
            		<Label for="end_date">Дуусах хугацаа</Label>
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
          			<Label for="seminar_count">Семинар лабораторын тоо</Label>
          		  		<Controller
          		    		name="seminar_count"
          		    		control={control}
          		    		rules={{ required: "Семинар лабораторын тоо шаардлагатай" }}
          		    		render={({ field }) => <Input {...field} type="number" />}
          		  		/>
          		  		{errors.seminar_count && (
          		  		  	<FormFeedback className="d-block">
          		  		  		{t(errors.seminar_count.message)}
          		  		  	</FormFeedback>
          		  		)}
          		</Col>
        		<Col md={6}>
        			<Label for="exam_count">Шалгалтын тоо</Label>
        			<Controller
        			  	name="exam_count"
        			  	control={control}
        			  	rules={{ required: "Шалгалтын тоо шаардлагатай" }}
        			  	render={({ field }) => <Input {...field} type="number" />}
        			/>
        			{errors.exam_count && (
        			  	<FormFeedback className="d-block">
        			  	  	{t(errors.exam_count.message)}
        			  	</FormFeedback>
        			)}
        		</Col>
          		<Col check>
          			<Controller
          				name="is_end_exam"
          				control={control}
          				render={({ field }) => <Input {...field} type="checkbox" />}
          		  	/>{" "}
          		  	<Label check>Төгсөлтийн шалгалтай эсэх</Label>
          		  	{errors.is_end_exam && (
          		    	<FormFeedback className="d-block">
          		      		{t(errors.is_end_exam.message)}
          		    	</FormFeedback>
          		  	)}
          		</Col>
        		</Row>
        		<div className="col-xs-6">
        			<Col md={6}>
        		    	<Label for="created_user">Үүсгэсэн хэрэглэгч</Label>
        		    	<Controller
        		      		name="created_user"
        		      		control={control}
        		      		rules={{ required: "Үүсгэсэн хэрэглэгч шаардлагатай" }}
        		      		render={({ field }) => (
        		      			<Input {...field} type="select">
        		      		    	<option value="">Сонгох...</option>
        		      		    	<option value={1}>1</option>
        		      		    	<option value={2}>2</option>
        		      		  	</Input>
        		      		)}
        		    	/>
        		    	{errors.created_user && (
        		    	  <FormFeedback className="d-block">
        		    	    {t(errors.created_user.message)}
        		    	  </FormFeedback>
        		    	)}
        		  	</Col>
        		  	<Col md={6}>
        		    	<Label for="students">Хичээл үзэх оюутнууд</Label>
        		    	<Controller
        		    	  	name="students"
        		    	  	control={control}
        		    	  	rules={{ required: "Оюутнуудын жагсаалт шаардлагатай" }}
        		    	  	render={({ field }) => (
        		    	  	  	<Input {...field} multiple type="select">
        		    	  	  	  	<option value={1891}>1</option>
        		    	  	  	  	<option value={1891}>2</option>
        		    	  	  	  	<option value={1891}>3</option>
        		    	  	  	  	<option value={1891}>4</option>
        		    	  	  	  	<option value={1891}>5</option>
        		    	  	  	</Input>
        		    	  	)}
        		    	/>
        		    	{errors.students && (
        		    	  	<FormFeedback className="d-block">
        		    	  	  	{t(errors.students.message)}
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

export default AddLessonForm;