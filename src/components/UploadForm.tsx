import { SyntheticEvent, DragEvent } from 'react';
import { Form } from 'react-bootstrap';
import './UploadForm.css';
import FileBufferObj from '../types/FileBufferObj';
import useGlobalStateStore from '../service/globalStateStore';

function UploadForm(props: {
  datei: React.MutableRefObject<FileBufferObj | null>;
  file: 'datei_neu' | 'datei_alt';
  className: string;
}) {
  const { page, setPageDone } = useGlobalStateStore();

  function dragover(e: SyntheticEvent) {
    e.preventDefault();
    (e.target as HTMLLabelElement).classList.add('dragover');
  }

  function dragleave(e: SyntheticEvent) {
    (e.target as HTMLLabelElement).classList.remove('dragover');
  }

  function drop(e: DragEvent) {
    e.preventDefault();
    (e.target as HTMLLabelElement).innerText = e.dataTransfer.files[0].name;
    submitFile(e.dataTransfer.files[0]);
  }

  function fs_input(e: SyntheticEvent) {
    const parentElement = (e.target as HTMLInputElement).parentElement;
    if (parentElement) {
      parentElement.classList.add('dragover');
      parentElement.innerText = (e.target as HTMLInputElement).files?.[0].name ?? '';
    }

    submitFile((e.target as HTMLInputElement).files?.[0] as File);
  }

  async function submitFile(file: File) {
    if (page === 'INIT') {
      props.datei.current = {
        name: file.name,
        buffer: await file.arrayBuffer(),
      };
      setPageDone();
    }
    if (page === 'INPUT_SECOND') {
      props.datei.current = {
        name: file.name,
        buffer: await file.arrayBuffer(),
      };
      setPageDone();
    }
  }

  return (
    <Form className="dropform">
      <Form.Group controlId={props.file} className={props.className}>
        <Form.Label
          className="dropzone"
          onDragOver={e => dragover(e)}
          onDragLeave={e => dragleave(e)}
          onDrop={e => drop(e)}
        >
          {props.file === 'datei_neu' && (
            <>
              Aktuellen Monatsbericht auf dieses Feld ziehen <br /> oder hier klicken
            </>
          )}
          {props.file === 'datei_alt' && (
            <>
              Alten Monatsbericht zum Vergleichen auf dieses Feld ziehen <br /> oder hier klicken
            </>
          )}
          <Form.Control type="file" onChange={e => fs_input(e)} />
        </Form.Label>
      </Form.Group>
    </Form>
  );
}

export default UploadForm;
