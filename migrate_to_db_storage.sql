-- Updated migration script for recruiter_details table
ALTER TABLE recruiter_details 
ADD COLUMN registration_cert_data LONGBLOB,
ADD COLUMN registration_cert_mimetype VARCHAR(100),
ADD COLUMN registration_cert_filename VARCHAR(255),
ADD COLUMN gst_doc_data LONGBLOB,
ADD COLUMN gst_doc_mimetype VARCHAR(100),
ADD COLUMN gst_doc_filename VARCHAR(255),
ADD COLUMN pan_doc_data LONGBLOB,
ADD COLUMN pan_doc_mimetype VARCHAR(100),
ADD COLUMN pan_doc_filename VARCHAR(255);
