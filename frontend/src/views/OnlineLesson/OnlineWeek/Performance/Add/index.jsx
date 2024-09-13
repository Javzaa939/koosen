import { Fragment, } from "react";
import { useTranslation } from "react-i18next";
import { ReactSelectStyles } from '@utils';
import classnames from "classnames";
import Select from 'react-select';
import {
	Button,
	Col,
	Label,
	Modal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Row
} from "reactstrap";

function Add({ open, handleModal , groups, selected_groups, handleSelectGroup, onSubmit}) {

	const { t } = useTranslation()

	return (
		<Fragment>
			<Modal toggle={handleModal} isOpen={open} className="modal-dialog-centered modal-lg">
				<ModalHeader
					toggle={handleModal}
				>
					<h5 className="modal-title">{t('Суралцагч нэмэх')}</h5>
				</ModalHeader>
				<ModalBody >
					<Row>
						<Col md={12}>
							<Label for="group">Анги</Label>
							<Select
								name="group"
								id="group"
								classNamePrefix="select"
								isClearable
								isMulti
								className={classnames('react-select')}
								placeholder={`-- Сонгоно уу --`}
								options={groups || []}
								value={selected_groups}
								noOptionsMessage={() => 'Хоосон байна'}
								onChange={(val) => handleSelectGroup(val)}
								styles={ReactSelectStyles}
								getOptionValue={(option) => option.id}
								getOptionLabel={(option) => option.name}
							/>
						</Col>
					</Row>
					<ModalFooter>
						<Button color="primary" type="submit" onClick={() => onSubmit()}>
							{t('Хадгалах')}
						</Button>
						<Button color="secondary" onClick={handleModal}>
							{t('Болих')}
						</Button>
					</ModalFooter>
			</ModalBody>
			</Modal>
		</Fragment>
	)
}

export default Add