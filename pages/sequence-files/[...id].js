// node_modules
import PropTypes from "prop-types";
// components
import AlternateAccessions from "../../components/alternate-accessions";
import Attribution from "../../components/attribution";
import Breadcrumbs from "../../components/breadcrumbs";
import { FileDataItems } from "../../components/common-data-items";
import { ControlledAccessIndicator } from "../../components/controlled-access";
import {
  DataArea,
  DataAreaTitle,
  DataItemLabel,
  DataItemValue,
  DataPanel,
} from "../../components/data-area";
import DerivedFromTable from "../../components/derived-from-table";
import DocumentTable from "../../components/document-table";
import { EditableItem } from "../../components/edit";
import { FileHeaderDownload } from "../../components/file-download";
import FileTable from "../../components/file-table";
import { HostedFilePreview } from "../../components/hosted-file-preview";
import JsonDisplay from "../../components/json-display";
import Link from "../../components/link-no-prefetch";
import ObjectPageHeader from "../../components/object-page-header";
import PagePreamble from "../../components/page-preamble";
import { QualityMetricPanel } from "../../components/quality-metric";
import SampleTable from "../../components/sample-table";
import { useSecDir } from "../../components/section-directory";
import { StatusPreviewDetail } from "../../components/status";
import WorkflowTable from "../../components/workflow-table";
// lib
import buildAttribution from "../../lib/attribution";
import {
  requestDocuments,
  requestFiles,
  requestQualityMetrics,
  requestWorkflows,
} from "../../lib/common-requests";
import { errorObjectToProps } from "../../lib/errors";
import FetchRequest from "../../lib/fetch-request";
import {
  checkForFileDownloadPath,
  convertFileDownloadPathToFilePagePath,
} from "../../lib/files";
import { truthyOrZero } from "../../lib/general";
import { isJsonFormat } from "../../lib/query-utils";

export default function SequenceFile({
  sequenceFile,
  fileSetSamples,
  documents,
  derivedFrom,
  inputFileFor,
  fileFormatSpecifications,
  workflows,
  qualityMetrics,
  attribution = null,
  isJson,
}) {
  const sections = useSecDir({ isJson });

  return (
    <>
      <Breadcrumbs item={sequenceFile} />
      <EditableItem item={sequenceFile}>
        <PagePreamble sections={sections} />
        <AlternateAccessions
          alternateAccessions={sequenceFile.alternate_accessions}
        />
        <ObjectPageHeader item={sequenceFile} isJsonFormat={isJson}>
          <ControlledAccessIndicator item={sequenceFile} />
          <FileHeaderDownload file={sequenceFile}>
            <HostedFilePreview file={sequenceFile} buttonSize="sm" />
          </FileHeaderDownload>
        </ObjectPageHeader>
        <JsonDisplay item={sequenceFile} isJsonFormat={isJson}>
          <StatusPreviewDetail item={sequenceFile} />
          <DataPanel>
            <DataArea>
              <FileDataItems item={sequenceFile} />
              <Attribution attribution={attribution} />
            </DataArea>
          </DataPanel>
          <DataAreaTitle id="sequencing-details">
            Sequencing Details
          </DataAreaTitle>
          <DataPanel>
            <DataArea>
              {sequenceFile.sequencing_platform && (
                <>
                  <DataItemLabel>Sequencing Platform</DataItemLabel>
                  <DataItemValue>
                    <Link href={sequenceFile.sequencing_platform["@id"]}>
                      {sequenceFile.sequencing_platform.term_name}
                    </Link>
                  </DataItemValue>
                </>
              )}
              <DataItemLabel>Sequencing Run</DataItemLabel>
              <DataItemValue>{sequenceFile.sequencing_run}</DataItemValue>
              {sequenceFile.flowcell_id && (
                <>
                  <DataItemLabel>Flowcell ID</DataItemLabel>
                  <DataItemValue>{sequenceFile.flowcell_id}</DataItemValue>
                </>
              )}
              {sequenceFile.lane && (
                <>
                  <DataItemLabel>Lane</DataItemLabel>
                  <DataItemValue>{sequenceFile.lane}</DataItemValue>
                </>
              )}
              {sequenceFile.sequencing_kit && (
                <>
                  <DataItemLabel>Sequencing Kit</DataItemLabel>
                  <DataItemValue>{sequenceFile.sequencing_kit}</DataItemValue>
                </>
              )}
              {sequenceFile.illumina_read_type && (
                <>
                  <DataItemLabel>Illumina Read Type</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.illumina_read_type}
                  </DataItemValue>
                </>
              )}
              {sequenceFile.index && (
                <>
                  <DataItemLabel>Index</DataItemLabel>
                  <DataItemValue>{sequenceFile.index}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.mean_read_length) && (
                <>
                  <DataItemLabel>Average Read Length</DataItemLabel>
                  <DataItemValue>{sequenceFile.mean_read_length}</DataItemValue>
                </>
              )}
              {truthyOrZero(sequenceFile.read_count) && (
                <>
                  <DataItemLabel>Read Count</DataItemLabel>
                  <DataItemValue>{sequenceFile.read_count}</DataItemValue>
                </>
              )}
              {sequenceFile.base_modifications?.length > 0 && (
                <>
                  <DataItemLabel>Base Modifications</DataItemLabel>
                  <DataItemValue>
                    {sequenceFile.base_modifications.join(", ")}
                  </DataItemValue>
                </>
              )}
            </DataArea>
          </DataPanel>
          {workflows.length > 0 && <WorkflowTable workflows={workflows} />}
          <QualityMetricPanel qualityMetrics={qualityMetrics} />
          {fileFormatSpecifications.length > 0 && (
            <DocumentTable
              documents={fileFormatSpecifications}
              title="File Format Specifications"
              panelId="file-format-specifications"
            />
          )}
          {fileSetSamples.length > 0 && (
            <SampleTable samples={fileSetSamples} />
          )}
          {derivedFrom.length > 0 && (
            <DerivedFromTable
              derivedFrom={derivedFrom}
              reportLink={`/multireport/?type=File&input_file_for=${sequenceFile["@id"]}`}
              reportLabel="Report of files that this file derives from"
              title="Files This File Derives From"
            />
          )}
          {inputFileFor.length > 0 && (
            <FileTable
              files={inputFileFor}
              reportLink={`/multireport/?type=File&derived_from=${sequenceFile["@id"]}`}
              reportLabel="Report of files derived from this file"
              title="Files Derived From This File"
              panelId="input-file-for"
            />
          )}
          {documents.length > 0 && <DocumentTable documents={documents} />}
        </JsonDisplay>
      </EditableItem>
    </>
  );
}

SequenceFile.propTypes = {
  // SequenceFile object to display
  sequenceFile: PropTypes.object.isRequired,
  // Samples from the file's file set
  fileSetSamples: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Documents associated with this file
  documents: PropTypes.array,
  // Files this file derives from
  derivedFrom: PropTypes.array,
  // Files that derive from this file
  inputFileFor: PropTypes.array.isRequired,
  // Documents for file format specifications
  fileFormatSpecifications: PropTypes.arrayOf(PropTypes.object),
  // Workflows that processed this file
  workflows: PropTypes.arrayOf(PropTypes.object).isRequired,
  // Quality metrics associated with this file
  qualityMetrics: PropTypes.arrayOf(PropTypes.object),
  // Attribution for this file
  attribution: PropTypes.object,
  // Is the format JSON?
  isJson: PropTypes.bool.isRequired,
};

export async function getServerSideProps({ params, req, query, resolvedUrl }) {
  // Redirect to the file page if the URL is a file download link.
  if (checkForFileDownloadPath(resolvedUrl)) {
    return {
      redirect: {
        destination: convertFileDownloadPathToFilePagePath(resolvedUrl),
        permanent: false,
      },
    };
  }

  const isJson = isJsonFormat(query);
  const request = new FetchRequest({ cookie: req.headers.cookie });
  const sequenceFile = (
    await request.getObject(`/sequence-files/${params.id}/`)
  ).union();
  if (FetchRequest.isResponseSuccess(sequenceFile)) {
    const documents = sequenceFile.documents
      ? await requestDocuments(sequenceFile.documents, request)
      : [];
    const derivedFrom = sequenceFile.derived_from
      ? await requestFiles(sequenceFile.derived_from, request)
      : [];
    const inputFileFor =
      sequenceFile.input_file_for?.length > 0
        ? await requestFiles(sequenceFile.input_file_for, request)
        : [];
    let fileFormatSpecifications = [];
    if (sequenceFile.file_format_specifications?.length > 0) {
      const fileFormatSpecificationsPaths =
        sequenceFile.file_format_specifications.map((document) =>
          typeof document === "string" ? document : document["@id"]
        );
      fileFormatSpecifications = await requestDocuments(
        fileFormatSpecificationsPaths,
        request
      );
    }
    let workflows = [];
    if (sequenceFile.workflows?.length > 0) {
      const workflowPaths = sequenceFile.workflows.map((workflow) =>
        typeof workflow === "string" ? workflow : workflow["@id"]
      );
      workflows = await requestWorkflows(workflowPaths, request);
    }
    const qualityMetrics =
      sequenceFile.quality_metrics?.length > 0
        ? await requestQualityMetrics(sequenceFile.quality_metrics, request)
        : [];
    // Resolve file_set so we can access its samples. The API may return it as
    // an embedded object or as a bare @id string depending on embed depth.
    const fileSet =
      typeof sequenceFile.file_set === "string"
        ? (await request.getObject(sequenceFile.file_set)).optional()
        : sequenceFile.file_set;
    const fileSetSamples = fileSet?.samples ?? [];

    const attribution = await buildAttribution(
      sequenceFile,
      req.headers.cookie
    );
    return {
      props: {
        sequenceFile,
        fileSetSamples,
        documents,
        derivedFrom,
        inputFileFor,
        fileFormatSpecifications,
        workflows,
        qualityMetrics,
        pageContext: { title: sequenceFile.accession },
        attribution,
        isJson,
      },
    };
  }
  return errorObjectToProps(sequenceFile);
}
